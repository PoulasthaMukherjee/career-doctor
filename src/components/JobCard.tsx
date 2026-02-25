'use client';

import { useState } from 'react';
import { logApplicationFromJob } from '@/lib/job-actions';
import { ExternalLink, PlusCircle, CheckCircle, MapPin, Clock, Briefcase, Building2 } from 'lucide-react';

type Job = {
    job_id: string;
    job_title: string;
    employer_name: string;
    employer_logo: string | null;
    employer_company_type: string | null;
    job_employment_type: string;
    job_apply_link: string;
    job_city: string;
    job_state: string;
    job_country: string;
    job_is_remote: boolean;
    job_posted_at_datetime_utc: string;
    job_min_salary: number | null;
    job_max_salary: number | null;
    job_salary_currency: string | null;
    job_salary_period: string | null;
    job_highlights?: {
        Qualifications?: string[];
        Responsibilities?: string[];
    };
    job_required_skills?: string[] | null;
};

export default function JobCard({ job, isApplied = false }: { job: Job; isApplied?: boolean }) {
    const [logged, setLogged] = useState(isApplied);
    const [logging, setLogging] = useState(false);

    const timeAgo = getTimeAgo(job.job_posted_at_datetime_utc);
    const location = formatLocation(job);
    const salary = formatSalary(job);
    const skills = job.job_required_skills?.slice(0, 4) || [];

    async function handleLog() {
        setLogging(true);
        try {
            const formData = new FormData();
            formData.set('company', job.employer_name);
            formData.set('role', job.job_title);
            formData.set('location', location);
            formData.set('workMode', job.job_is_remote ? 'remote' : 'onsite');
            formData.set('source', 'JSearch');

            await logApplicationFromJob(formData);
            setLogged(true);
        } catch {
            // silently fail
        } finally {
            setLogging(false);
        }
    }

    return (
        <div className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col hover:shadow-md transition-shadow group ${logged ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200'}`}>
            {/* Header: Logo + Company */}
            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {job.employer_logo ? (
                        <img
                            src={job.employer_logo}
                            alt={job.employer_name}
                            className="w-10 h-10 object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-lg font-bold text-slate-400">${job.employer_name.charAt(0)}</span>`;
                            }}
                        />
                    ) : (
                        <span className="text-lg font-bold text-slate-400">{job.employer_name.charAt(0)}</span>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-700 transition-colors">
                        {job.job_title}
                    </h3>
                    <p className="text-sm text-slate-600 font-medium mt-0.5">{job.employer_name}</p>
                </div>
            </div>

            {/* Meta info */}
            <div className="space-y-2 text-sm text-slate-500 mb-4">
                <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{location}</span>
                    {job.job_is_remote && (
                        <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Remote</span>
                    )}
                </div>
                {salary && (
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate text-emerald-600 font-medium">{salary}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span>{timeAgo} · {formatEmploymentType(job.job_employment_type)}</span>
                </div>
                {job.employer_company_type && (
                    <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{job.employer_company_type}</span>
                    </div>
                )}
            </div>

            {/* Skills */}
            {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                    {skills.map((skill, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                            {skill}
                        </span>
                    ))}
                    {(job.job_required_skills?.length || 0) > 4 && (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-slate-50 text-slate-400 rounded-full">
                            +{(job.job_required_skills?.length || 0) - 4}
                        </span>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                <a
                    href={job.job_apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                    <ExternalLink className="h-4 w-4" />
                    Apply Now
                </a>
                <button
                    onClick={handleLog}
                    disabled={logged || logging}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                        ${logged
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }
                    `}
                >
                    {logged ? (
                        <>
                            <CheckCircle className="h-4 w-4" />
                            Applied
                        </>
                    ) : logging ? (
                        'Logging...'
                    ) : (
                        <>
                            <PlusCircle className="h-4 w-4" />
                            Log
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

function formatLocation(job: Job): string {
    if (job.job_is_remote && !job.job_city) return 'Remote';
    const parts = [job.job_city, job.job_state, job.job_country].filter(Boolean);
    return parts.join(', ') || 'Not specified';
}

function formatSalary(job: Job): string | null {
    if (!job.job_min_salary && !job.job_max_salary) return null;
    const currency = job.job_salary_currency || 'USD';
    const period = job.job_salary_period === 'YEAR' ? '/yr' : job.job_salary_period === 'HOUR' ? '/hr' : '';
    const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;

    if (job.job_min_salary && job.job_max_salary) {
        return `${currency} ${fmt(job.job_min_salary)} – ${fmt(job.job_max_salary)}${period}`;
    }
    return `${currency} ${fmt(job.job_min_salary || job.job_max_salary!)}${period}`;
}

function formatEmploymentType(type: string): string {
    const map: Record<string, string> = {
        FULLTIME: 'Full-time',
        PARTTIME: 'Part-time',
        CONTRACTOR: 'Contract',
        INTERN: 'Intern',
    };
    return map[type] || type || 'Full-time';
}

function getTimeAgo(dateStr: string): string {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
}
