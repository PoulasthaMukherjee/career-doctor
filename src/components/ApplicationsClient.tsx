'use client';

import { useState } from 'react';
import { deleteApplication, updateApplicationStatus } from '@/lib/job-actions';
import { Building2, MapPin, Calendar, Clock, Link as LinkIcon, FileText, Trash2, ChevronDown, X } from 'lucide-react';

type AppData = {
    id: string;
    company: string;
    role: string;
    companySize: string | null;
    location: string | null;
    workMode: string | null;
    source: string | null;
    outcome: string;
    resumeVersion: string | null;
    applyTime: string;
    daysSincePosted: number | null;
};

const STATUSES = [
    { value: 'IGNORED', label: 'No Response', color: 'bg-slate-500/15 text-slate-400 border-slate-500/20' },
    { value: 'OA', label: 'OA / Assessment', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    { value: 'INTERVIEW', label: 'Interview', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
    { value: 'OFFER', label: 'Offer 🎉', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    { value: 'REJECTED', label: 'Rejected', color: 'bg-red-500/15 text-red-400 border-red-500/20' },
];

const BAR_COLORS: Record<string, string> = {
    IGNORED: 'bg-[var(--border)]',
    OA: 'bg-blue-500',
    INTERVIEW: 'bg-indigo-500',
    OFFER: 'bg-emerald-500',
    REJECTED: 'bg-red-500',
};

export default function ApplicationsClient({ applications: initial }: { applications: AppData[] }) {
    const [apps, setApps] = useState(initial);
    const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    async function handleDelete(id: string) {
        if (confirmingDelete !== id) {
            setConfirmingDelete(id);
            // Auto-reset after 3 seconds
            setTimeout(() => setConfirmingDelete(prev => prev === id ? null : prev), 3000);
            return;
        }
        setDeleting(id);
        try {
            await deleteApplication(id);
            setApps(prev => prev.filter(a => a.id !== id));
        } catch (e) {
            console.error('Delete failed:', e);
        } finally {
            setDeleting(null);
            setConfirmingDelete(null);
        }
    }

    async function handleStatusChange(id: string, status: string) {
        try {
            await updateApplicationStatus(id, status);
            setApps(prev => prev.map(a => a.id === id ? { ...a, outcome: status } : a));
        } catch { /* ignore */ }
    }

    // Status filter
    const [filter, setFilter] = useState('ALL');
    const filtered = filter === 'ALL' ? apps : apps.filter(a => a.outcome === filter);
    const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s.value]: apps.filter(a => a.outcome === s.value).length }), {} as Record<string, number>);

    return (
        <div>
            {/* Status filter bar */}
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
                <button onClick={() => setFilter('ALL')}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${filter === 'ALL' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-tertiary)]'}`}>
                    All ({apps.length})
                </button>
                {STATUSES.map(s => (
                    <button key={s.value} onClick={() => setFilter(s.value)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${filter === s.value ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-tertiary)]'}`}>
                        {s.label} ({counts[s.value] || 0})
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((app) => {
                    const statusInfo = STATUSES.find(s => s.value === app.outcome) || STATUSES[0];
                    const isConfirming = confirmingDelete === app.id;
                    const isDeleting = deleting === app.id;
                    return (
                        <div key={app.id} className="bg-[var(--bg-secondary)] rounded-xl shadow-[var(--card-shadow)] border border-[var(--border)] p-6 relative overflow-hidden group">
                            {/* Status Indicator Bar */}
                            <div className={`absolute top-0 left-0 w-1 h-full ${BAR_COLORS[app.outcome] || BAR_COLORS.IGNORED}`} />

                            {/* Delete button - always visible */}
                            <button
                                onClick={() => handleDelete(app.id)}
                                disabled={isDeleting}
                                className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${isConfirming
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10'
                                    } ${isDeleting ? 'opacity-50' : ''}`}
                                title="Remove"
                            >
                                {isDeleting ? (
                                    'Removing...'
                                ) : isConfirming ? (
                                    <><X className="h-3 w-3" /> Confirm?</>
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </button>

                            <div className="pl-3">
                                <div className="flex justify-between items-start mb-2 pr-8">
                                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{app.company}</h3>
                                </div>

                                {/* Status dropdown */}
                                <div className="mb-3">
                                    <div className="relative inline-block">
                                        <select
                                            value={app.outcome}
                                            onChange={e => handleStatusChange(app.id, e.target.value)}
                                            className={`appearance-none cursor-pointer text-xs font-semibold px-3 py-1.5 pr-7 rounded-full border ${statusInfo.color} bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                                        >
                                            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
                                    </div>
                                </div>

                                <p className="text-md font-medium text-[var(--accent-text)] mb-4">{app.role}</p>

                                <div className="space-y-2 text-sm text-[var(--text-secondary)] mb-6">
                                    {app.companySize && (
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-[var(--text-tertiary)]" />
                                            <span>{app.companySize}</span>
                                        </div>
                                    )}
                                    {app.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-[var(--text-tertiary)]" />
                                            <span>{app.location} {app.workMode && `(${app.workMode})`}</span>
                                        </div>
                                    )}
                                    {app.source && (
                                        <div className="flex items-center gap-2">
                                            <LinkIcon className="h-4 w-4 text-[var(--text-tertiary)]" />
                                            <span>Via {app.source}</span>
                                        </div>
                                    )}
                                    {app.resumeVersion && (
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-[var(--text-tertiary)]" />
                                            <span>{app.resumeVersion} used</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-between text-xs text-[var(--text-tertiary)] font-medium">
                                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Applied {new Date(app.applyTime).toLocaleDateString()}</span>
                                    {app.daysSincePosted !== null && (
                                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Age {app.daysSincePosted}d</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

