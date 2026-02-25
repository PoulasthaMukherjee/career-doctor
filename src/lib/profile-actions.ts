'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { extractAndParseResume } from "@/lib/parse-resume";
import { askGemini } from "./ai";

export async function getProfile() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
    });

    if (!profile) return null;

    return {
        ...profile,
        skills: profile.skills ? JSON.parse(profile.skills) : [],
        experience: profile.experience ? JSON.parse(profile.experience) : [],
        education: profile.education ? JSON.parse(profile.education) : [],
        links: profile.links ? JSON.parse(profile.links) : [],
        projects: profile.projects ? JSON.parse(profile.projects) : [],
        achievements: profile.achievements ? JSON.parse(profile.achievements) : [],
        certifications: profile.certifications ? JSON.parse(profile.certifications) : [],
    };
}

export async function saveProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const data = {
        fullName: formData.get('fullName') as string || null,
        title: formData.get('title') as string || null,
        email: formData.get('email') as string || null,
        phone: formData.get('phone') as string || null,
        location: formData.get('location') as string || null,
        summary: formData.get('summary') as string || null,
        skills: formData.get('skills') as string || '[]',
        experience: formData.get('experience') as string || '[]',
        education: formData.get('education') as string || '[]',
        links: formData.get('links') as string || '[]',
        projects: formData.get('projects') as string || '[]',
        achievements: formData.get('achievements') as string || '[]',
        certifications: formData.get('certifications') as string || '[]',
    };

    await prisma.profile.upsert({
        where: { userId: session.user.id },
        update: data,
        create: { userId: session.user.id, ...data },
    });

    revalidatePath('/profile');
    return { success: true };
}

export async function autofillProfileFromResume(resumeId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const resume = await prisma.resume.findUnique({
        where: { id: resumeId, userId: session.user.id },
    });

    if (!resume?.parsedContent) {
        return { error: "No parsed data available. Use 'Parse & Fill' to parse first." };
    }

    try {
        const parsed = JSON.parse(resume.parsedContent);
        return applyParsedToProfile(session.user.id, parsed);
    } catch {
        return { error: "Failed to read parsed resume data" };
    }
}

export async function parseAndFillFromResume(resumeId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const resume = await prisma.resume.findUnique({
        where: { id: resumeId, userId: session.user.id },
    });

    if (!resume) return { error: "Resume not found" };

    if (resume.parsedContent) {
        try {
            const parsed = JSON.parse(resume.parsedContent);
            return applyParsedToProfile(session.user.id, parsed);
        } catch { /* fall through */ }
    }

    if (!resume.fileData) {
        return { error: "No PDF file uploaded. Upload a PDF first." };
    }

    try {
        const buffer = Buffer.from(resume.fileData, 'base64');
        const pdfjsLib = await import('pdfjs-dist');
        const data = new Uint8Array(buffer);
        const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;

        let fullText = "";
        for (let i = 1; i <= doc.numPages; i++) {
            const page = await doc.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items
                .filter((item: any) => 'str' in item)
                .map((item: any) => item.str);
            fullText += strings.join(' ') + '\n\n';
        }

        if (fullText.trim().length <= 20) return { error: "Failed to extract text from PDF" };

        const { parseResumeWithAI } = await import('./ai');
        const parsedObj = await parseResumeWithAI(fullText);
        if (!parsedObj) return { error: "Failed to extract text from PDF" };

        await prisma.resume.update({
            where: { id: resumeId },
            data: { parsedContent: JSON.stringify(parsedObj) },
        });

        return applyParsedToProfile(session.user.id, parsedObj);
    } catch (e) {
        console.error('Parse error:', e);
        return { error: "AI parsing failed. Please try again." };
    }
}

export async function generateAISummary(profileDataJson: string): Promise<{ summary?: string; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const prompt = `Generate a concise, professional summary (2-3 sentences) for a resume based on this profile data. Write in first person. Be specific and impactful. No markdown, just plain text.

Profile data:
${profileDataJson}`;

    const result = await askGemini(prompt);
    if (!result) return { error: "AI generation failed. Quota may be exhausted. Try again later." };

    return { summary: result.trim() };
}

async function applyParsedToProfile(userId: string, parsed: any) {
    const experience = (parsed.experience || []).map((e: any) =>
        typeof e === 'string'
            ? { company: '', title: e, location: '', startDate: '', endDate: '', description: '' }
            : { company: e.company || '', title: e.title || e.role || '', location: e.location || '', startDate: e.startDate || e.start || '', endDate: e.endDate || e.end || '', description: e.description || '' }
    );

    const education = (parsed.education || []).map((e: any) =>
        typeof e === 'string'
            ? { institution: e, degree: '', specialization: '', startYear: '', endYear: '', grade: '' }
            : { institution: e.institution || e.school || '', degree: e.degree || '', specialization: e.specialization || e.field || '', startYear: e.startYear || e.start || '', endYear: e.endYear || e.end || '', grade: e.grade || e.gpa || '' }
    );

    const links = (parsed.links || []).map((l: any) => {
        if (typeof l === 'string') {
            const type = l.includes('linkedin') ? 'linkedin' : l.includes('github') ? 'github' : l.includes('medium') ? 'medium' : 'other';
            return { type, url: l };
        }
        return { type: l.type || 'other', url: l.url || '' };
    });

    const projects = (parsed.projects || []).map((p: any) =>
        typeof p === 'string'
            ? { name: p, description: '', techStack: '', url: '', startDate: '', endDate: '' }
            : { name: p.name || '', description: p.description || '', techStack: p.techStack || p.technologies || '', url: p.url || '', startDate: p.startDate || '', endDate: p.endDate || '' }
    );

    const achievements = (parsed.achievements || []).map((a: any) =>
        typeof a === 'string'
            ? { title: a, description: '', date: '' }
            : { title: a.title || '', description: a.description || '', date: a.date || '' }
    );

    const certifications = (parsed.certifications || []).map((c: any) =>
        typeof c === 'string'
            ? { name: c, issuer: '', date: '', url: '' }
            : { name: c.name || '', issuer: c.issuer || '', date: c.date || '', url: c.url || '' }
    );

    const data = {
        fullName: parsed.name || null,
        title: parsed.title || null,
        email: parsed.email || null,
        phone: parsed.phone || null,
        location: parsed.location || null,
        summary: parsed.summary || null,
        skills: JSON.stringify(parsed.skills || []),
        experience: JSON.stringify(experience),
        education: JSON.stringify(education),
        links: JSON.stringify(links),
        projects: JSON.stringify(projects),
        achievements: JSON.stringify(achievements),
        certifications: JSON.stringify(certifications),
    };

    await prisma.profile.upsert({
        where: { userId },
        update: data,
        create: { userId, ...data },
    });

    revalidatePath('/profile');
    return { success: true };
}
