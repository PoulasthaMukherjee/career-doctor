'use client';

import { useState, useRef, useCallback } from 'react';
import { createResume } from '@/lib/resume-actions';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, X, FileText, CheckCircle } from 'lucide-react';

export default function NewResumeForm() {
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileData, setFileData] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = useCallback(async (file: File) => {
        setError(null);
        if (file.type !== 'application/pdf') { setError('Only PDF files are allowed.'); return; }
        if (file.size > 5 * 1024 * 1024) { setError('File must be under 5MB.'); return; }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Upload failed.'); return; }
            setFileName(data.fileName);
            setFileData(data.fileData || null);
            setDisplayName(file.name);
        } catch { setError('Upload failed. Please try again.'); }
        finally { setUploading(false); }
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(file);
    }, [handleUpload]);

    const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
    }, [handleUpload]);

    const removeFile = () => {
        setFileName(null); setFileData(null); setDisplayName(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const inputClass = "w-full px-4 py-2.5 border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text-primary)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-shadow placeholder-[var(--text-tertiary)]";

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/resumes" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium flex items-center gap-2 mb-6 transition-colors w-max">
                    <ArrowLeft className="h-4 w-4" /> Back to Resumes
                </Link>

                <div className="bg-[var(--bg-secondary)] rounded-xl shadow-[var(--card-shadow)] border border-[var(--border)] p-6 sm:p-8">
                    <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">Add New Resume</h1>

                    <form action={createResume} className="space-y-6">
                        <input type="hidden" name="fileName" value={fileName || ''} />
                        <input type="hidden" name="fileData" value={fileData || ''} />

                        <div>
                            <label htmlFor="version" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Version Name *
                            </label>
                            <input type="text" id="version" name="version" required
                                placeholder='e.g. "Frontend Focus", "Resume 2024"'
                                className={inputClass} />
                        </div>

                        {/* File Upload Area */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Upload Resume (PDF)
                            </label>

                            {!fileName ? (
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={onDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                                        ${dragOver ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--bg-tertiary)]'}
                                        ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <input ref={fileInputRef} type="file" accept=".pdf" onChange={onFileSelect} className="hidden" />
                                    <Upload className={`h-10 w-10 mx-auto mb-3 ${dragOver ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`} />
                                    {uploading ? (
                                        <p className="text-sm text-[var(--text-secondary)] font-medium">Uploading...</p>
                                    ) : (
                                        <>
                                            <p className="text-sm font-medium text-[var(--text-primary)]">
                                                Drag & drop your PDF here, or <span className="text-[var(--accent-text)]">click to browse</span>
                                            </p>
                                            <p className="text-xs text-[var(--text-tertiary)] mt-1">PDF only, max 5MB</p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-4 bg-[var(--success-light)] border border-[var(--border)] rounded-xl">
                                    <div className="p-2 bg-[var(--success-light)] rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-[var(--success)]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{displayName}</p>
                                        <p className="text-xs text-[var(--success)]">Uploaded successfully</p>
                                    </div>
                                    <button type="button" onClick={removeFile}
                                        className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors rounded-lg hover:bg-[var(--danger-light)]">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {error && <p className="text-sm text-[var(--danger)] mt-2">{error}</p>}
                        </div>

                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Notes (Optional)
                            </label>
                            <textarea id="content" name="content" rows={3}
                                placeholder="Key changes in this version, target roles, etc."
                                className={inputClass} />
                        </div>

                        <div className="pt-2">
                            <button type="submit"
                                className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-sm flex justify-center items-center gap-2">
                                <Save className="h-5 w-5" /> Save Resume
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
