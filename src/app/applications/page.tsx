import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import ApplicationsClient from "@/components/ApplicationsClient";

export default async function ApplicationsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const applications = await prisma.application.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: { resume: true }
    });

    const serialized = applications.map((app: any) => ({
        id: app.id,
        company: app.company,
        role: app.role,
        companySize: app.companySize,
        location: app.location,
        workMode: app.workMode,
        source: app.source,
        outcome: app.outcome,
        resumeVersion: app.resume?.version || null,
        applyTime: app.applyTime.toISOString(),
        daysSincePosted: app.daysSincePosted,
    }));

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight">Applications</h1>
                        <p className="text-[var(--text-secondary)] mt-1">Track your job hunt and measure your funnel.</p>
                    </div>
                    <Link href="/applications/new" className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center">
                        <Plus className="h-5 w-5" /> Add Application
                    </Link>
                </div>

                {applications.length === 0 ? (
                    <div className="bg-[var(--bg-secondary)] rounded-xl shadow-[var(--card-shadow)] border border-[var(--border)] p-12 text-center">
                        <Briefcase className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">No applications yet</h3>
                        <p className="text-[var(--text-secondary)] mb-6">Log your first job application and start analyzing your behavior.</p>
                        <Link href="/applications/new" className="bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] px-4 py-2 rounded-md font-medium transition-colors">
                            Log an Application
                        </Link>
                    </div>
                ) : (
                    <ApplicationsClient applications={serialized} />
                )}
            </div>
        </div>
    );
}
