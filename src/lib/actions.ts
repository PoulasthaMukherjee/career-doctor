'use server';

import { computeMetrics, ApplicationInput } from './engines/analysis';
import { runDiagnosis } from './engines/diagnosis';
import { runPrescription } from './engines/prescription';
import { getAIInsights } from './ai';
import { auth, signIn as nextAuthSignIn } from "@/lib/auth";
import AuthError from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { registerSchema } from "./validations";
import { sendWelcomeEmail } from "./email";

export async function getDashboardData(userId: string) {
    const applications = await prisma.application.findMany({
        where: { userId },
        include: { resume: true }
    });

    if (applications.length === 0) {
        return {
            metrics: null,
            diagnoses: [],
            prescriptions: [],
            funnel: { applied: 0, viewed: 0, responded: 0, interview: 0, offer: 0 },
            aiInsights: null,
        }
    }

    // Map to the shape expected by the purely functional engine
    const appInputs: ApplicationInput[] = applications.map((app: any) => ({
        outcome: app.outcome,
        companySize: app.companySize,
        role: app.role,
        source: app.source,
        daysSincePosted: app.daysSincePosted,
        resume: app.resume ? { version: app.resume.version } : null
    }));

    const metrics = computeMetrics(appInputs);
    const diagnoses = runDiagnosis(metrics);
    const prescriptions = runPrescription(diagnoses);

    // Compute Funnel data
    const totalApplied = appInputs.length;
    const totalResponses = appInputs.filter(a => a.outcome !== 'IGNORED').length;

    const funnel = {
        applied: totalApplied,
        viewed: Math.max(Math.round(totalApplied * 0.6), totalResponses),
        responded: totalResponses,
        interview: appInputs.filter(a => a.outcome === 'INTERVIEW' || a.outcome === 'OFFER').length,
        offer: appInputs.filter(a => a.outcome === 'OFFER').length
    };

    // Get AI insights (non-blocking — gracefully returns null if no key)
    let aiInsights = null;
    try {
        aiInsights = await getAIInsights(JSON.stringify({
            metrics,
            funnel,
            applicationCount: applications.length,
            companies: applications.map(a => a.company).slice(0, 10),
            roles: applications.map(a => a.role).slice(0, 10),
        }));
    } catch {
        // AI insights are optional
    }

    return {
        metrics,
        diagnoses,
        prescriptions,
        funnel,
        aiInsights,
    };
}

export async function signIn(formData: FormData) {
    try {
        await nextAuthSignIn("credentials", formData);
    } catch (error: any) {
        if (error?.type === "CredentialsSignin" || error?.name === "CredentialsSignin") {
            return { error: "Invalid credentials." };
        }
        // NextAuth throws redirects on success, we must rethrow it
        if (error?.message?.includes("NEXT_REDIRECT") || error?.digest?.includes('NEXT_REDIRECT')) {
            throw error;
        }
        return { error: "Something went wrong." };
    }
}

export async function registerUser(formData: FormData) {
    try {
        const rawData = Object.fromEntries(formData.entries());
        const validatedData = registerSchema.safeParse(rawData);

        if (!validatedData.success) {
            return { error: validatedData.error.issues[0].message };
        }

        const { name, email, password } = validatedData.data;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: "A user with this email already exists." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // Send welcome email (fire and forget, don't await blocking the response)
        sendWelcomeEmail(email, name || '').catch(console.error);

        return { success: "Account created successfully. Please sign in." };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "Something went wrong during registration." };
    }
}

export async function updateProfileFromAI(targetRole: string, skillsToAdd: string[]) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const profile = await prisma.profile.findUnique({
            where: { userId: session.user.id }
        });

        if (!profile) throw new Error("Profile not found");

        let currentSkills: string[] = [];
        try {
            if (profile.skills) currentSkills = JSON.parse(profile.skills);
        } catch (e) { }

        // Merge skills without duplicates
        const updatedSkills = Array.from(new Set([...currentSkills, ...skillsToAdd]));

        // Rewrite the summary to reflect the new career target
        const currentSummary = profile.summary || '';
        const updatedSummary = currentSummary
            ? currentSummary
                .replace(/targeting\s+[\w\s,/&-]+roles?/gi, `targeting ${targetRole} roles`)
                .replace(/aspiring\s+[\w\s]+/gi, `aspiring ${targetRole}`)
            : `Professional pivoting to ${targetRole} with skills in ${skillsToAdd.join(', ')}.`;

        // If the regex didn't change anything, append the target info
        const finalSummary = (updatedSummary === currentSummary && currentSummary)
            ? `${currentSummary} Currently targeting ${targetRole} roles.`
            : updatedSummary;

        // Update the profile in the database
        await prisma.profile.update({
            where: { userId: session.user.id },
            data: {
                title: targetRole,
                skills: JSON.stringify(updatedSkills),
                summary: finalSummary,
            }
        });

        // Clear any cached analysis so it gets regenerated fresh
        try {
            await prisma.profile.update({
                where: { userId: session.user.id },
                data: { careerAnalysis: null } as any
            });
        } catch { /* careerAnalysis column may not exist, ignore */ }

        // Trigger a fresh career analysis manually so the data is instantly available
        const { getCareerAnalysis } = await import('./career-analysis');
        await getCareerAnalysis();

        return { success: true };
    } catch (error) {
        console.error("Failed to update profile from AI:", error);
        throw error;
    }
}
