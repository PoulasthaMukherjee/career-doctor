import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function NewApplicationPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const resumes = await prisma.resume.findMany({
        where: { userId: session.user.id },
        select: { id: true, version: true }
    });

    async function createApplication(formData: FormData) {
        'use server';
        const userId = session?.user?.id;
        if (!userId) return;

        await prisma.application.create({
            data: {
                userId,
                company: formData.get('company') as string,
                role: formData.get('role') as string,
                companySize: (formData.get('companySize') as string) || null,
                location: (formData.get('location') as string) || null,
                workMode: (formData.get('workMode') as string) || null,
                source: (formData.get('source') as string) || null,
                daysSincePosted: formData.get('daysSincePosted') ? parseInt(formData.get('daysSincePosted') as string, 10) : null,
                resumeId: (formData.get('resumeId') as string) || null,
                outcome: "IGNORED"
            }
        });

        revalidatePath('/applications');
        redirect('/applications');
    }

    return (
        <div className="min-h-screen bg-[#fafafa] p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/applications" className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-2 mb-6 transition-colors w-max">
                    <ArrowLeft className="h-4 w-4" /> Back to Applications
                </Link>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
                    <h1 className="text-2xl font-semibold text-slate-900 mb-6">Log New Application</h1>

                    <form action={createApplication} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Company *</label>
                                <input required type="text" name="company" placeholder="e.g. Stripe" className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
                                <input required type="text" name="role" placeholder="e.g. Backend Engineer" className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Company Size</label>
                                <select name="companySize" className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 bg-white">
                                    <option value="">Select size...</option>
                                    <option value="startup (<500)">Startup (&lt;500)</option>
                                    <option value="mid-size (500-5000)">Mid-Size (500-5000)</option>
                                    <option value="enterprise (>5000)">Enterprise (&gt;5000)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Work Mode</label>
                                <select name="workMode" className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 bg-white">
                                    <option value="">Select mode...</option>
                                    <option value="remote">Remote</option>
                                    <option value="hybrid">Hybrid</option>
                                    <option value="onsite">On-site</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Source (How you applied)</label>
                                <select name="source" className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 bg-white">
                                    <option value="">Select source...</option>
                                    <option value="Company Website">Company Website</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="Easy Apply">Easy Apply (LinkedIn/Indeed)</option>
                                    <option value="Referral">Referral</option>
                                    <option value="Recruiter">Recruiter Outreach</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Days Since Job Posted</label>
                                <input type="number" name="daysSincePosted" min="0" placeholder="e.g. 2" className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Which resume did you use?</label>
                            <select name="resumeId" className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 bg-white">
                                <option value="">I didn't use a specific saved resume</option>
                                {resumes.map((r: any) => (
                                    <option key={r.id} value={r.id}>{r.version}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-sm flex justify-center items-center gap-2">
                                <Save className="h-5 w-5" /> Save Application
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
