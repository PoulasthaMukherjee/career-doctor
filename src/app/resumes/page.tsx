import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, Download, Trash2, Sparkles, Eye } from "lucide-react";
import { deleteResume } from "@/lib/resume-actions";

export default async function ResumesPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const resumes = await prisma.resume.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight">Resumes</h1>
                        <p className="text-[var(--text-secondary)] mt-1">Manage all your tailored resume versions.</p>
                    </div>
                    <Link href="/resumes/new" className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
                        <Plus className="h-5 w-5" /> Add Resume
                    </Link>
                </div>

                {resumes.length === 0 ? (
                    <div className="bg-[var(--bg-secondary)] rounded-xl shadow-[var(--card-shadow)] border border-[var(--border)] p-12 text-center">
                        <FileText className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">No resumes yet</h3>
                        <p className="text-[var(--text-secondary)] mb-6">Upload your first resume to start tracking which version works best.</p>
                        <Link href="/resumes/new" className="bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] px-4 py-2 rounded-md font-medium transition-colors">
                            Add your first resume
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resumes.map((resume: any) => (
                            <div key={resume.id} className="bg-[var(--bg-secondary)] rounded-xl shadow-[var(--card-shadow)] border border-[var(--border)] p-6 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-[var(--accent-light)] text-[var(--accent-text)] rounded-lg">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <form action={async () => {
                                        'use server';
                                        await deleteResume(resume.id);
                                    }}>
                                        <button type="submit" className="text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </form>
                                </div>
                                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1 line-clamp-1">{resume.version}</h3>
                                <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
                                    {resume.content || "No notes provided."}
                                </p>

                                {/* AI Parsed badge */}
                                {resume.parsedContent && (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent-text)] bg-[var(--accent-light)] w-max px-2.5 py-1 rounded-full mb-3">
                                        <Sparkles className="h-3 w-3" /> AI Parsed
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-2 mb-4">
                                    {resume.fileName && (
                                        <>
                                            <a
                                                href={`/api/resume-file/${resume.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-xs font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <Eye className="h-3.5 w-3.5" /> Preview
                                            </a>
                                            <a
                                                href={`/api/resume-file/${resume.id}`}
                                                download
                                                className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 px-3 py-1.5 rounded-lg border border-[var(--border)] transition-colors"
                                            >
                                                <Download className="h-3.5 w-3.5" /> Download
                                            </a>
                                        </>
                                    )}
                                </div>

                                <div className="mt-auto pt-4 border-t border-[var(--border)] flex justify-between items-center text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wider">
                                    <span>Created</span>
                                    <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
