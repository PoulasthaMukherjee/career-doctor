'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const STATUSES = ['IGNORED', 'OA', 'INTERVIEW', 'OFFER', 'REJECTED'] as const;

export async function logApplicationFromJob(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const company = formData.get("company") as string;
    const role = formData.get("role") as string;
    const location = formData.get("location") as string;
    const workMode = formData.get("workMode") as string;
    const source = formData.get("source") as string;

    if (!company || !role) throw new Error("Company and role are required");

    await prisma.application.create({
        data: {
            userId: session.user.id,
            company,
            role,
            location: location || null,
            workMode: workMode || "remote",
            source: source || "Remotive",
            outcome: "IGNORED",
            daysSincePosted: 0,
        },
    });

    revalidatePath("/applications");
    revalidatePath("/");

    return { success: true };
}

export async function deleteApplication(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.application.deleteMany({
        where: { id, userId: session.user.id },
    });

    revalidatePath("/applications");
    revalidatePath("/");

    return { success: true };
}

export async function updateApplicationStatus(id: string, status: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    if (!STATUSES.includes(status as any)) throw new Error("Invalid status");

    await prisma.application.updateMany({
        where: { id, userId: session.user.id },
        data: { outcome: status },
    });

    revalidatePath("/applications");
    revalidatePath("/");

    return { success: true };
}

export async function getAppliedJobs(): Promise<{ company: string; role: string }[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    const apps = await prisma.application.findMany({
        where: { userId: session.user.id },
        select: { company: true, role: true },
    });

    return apps.map(a => ({ company: a.company.toLowerCase(), role: a.role.toLowerCase() }));
}

