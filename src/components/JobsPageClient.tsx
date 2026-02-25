'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Briefcase, Loader2, AlertCircle, Globe, Zap, MapPin, DollarSign } from 'lucide-react';
import JobCard from '@/components/JobCard';
import { getAppliedJobs } from '@/lib/job-actions';

const DATE_FILTERS = [
    { value: '', label: 'Any time' },
    { value: 'today', label: 'Today' },
    { value: '3days', label: 'Last 3 days' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
];

const EMPLOYMENT_TYPES = [
    { value: '', label: 'All Types' },
    { value: 'FULLTIME', label: 'Full-time' },
    { value: 'PARTTIME', label: 'Part-time' },
    { value: 'CONTRACTOR', label: 'Contract' },
    { value: 'INTERN', label: 'Internship' },
];

const EXPERIENCE_LEVELS = [
    { value: '', label: 'Any Level' },
    { value: 'under_3_years_experience', label: 'Entry Level' },
    { value: 'more_than_3_years_experience', label: 'Mid Level' },
    { value: 'no_experience', label: 'No Experience' },
    { value: 'no_degree', label: 'No Degree' },
];

function extractCountry(loc: string): string {
    if (!loc) return '';
    // Common patterns: "City, State" → guess country, or "City, Country"
    const parts = loc.split(',').map(s => s.trim());
    // If it looks like an Indian location, return India
    const indianStates = ['assam', 'maharashtra', 'karnataka', 'delhi', 'tamil nadu', 'telangana', 'west bengal', 'uttar pradesh', 'gujarat', 'rajasthan', 'kerala', 'punjab', 'haryana', 'odisha', 'madhya pradesh', 'andhra pradesh', 'bihar', 'goa'];
    if (parts.some(p => indianStates.includes(p.toLowerCase()))) return 'India';
    // US states
    const usStates = ['ca', 'ny', 'tx', 'wa', 'fl', 'il', 'ma', 'pa', 'oh', 'ga', 'nc', 'nj', 'va', 'co', 'az', 'or', 'mn', 'mo', 'wi', 'md', 'tn', 'in', 'mi', 'ct'];
    if (parts.some(p => usStates.includes(p.toLowerCase()) || p.length === 2)) return 'United States';
    // UK
    if (parts.some(p => ['london', 'manchester', 'birmingham', 'uk', 'england', 'scotland'].includes(p.toLowerCase()))) return 'United Kingdom';
    // Last part is likely country
    return parts[parts.length - 1] || loc;
}

export default function JobsPageClient({ profileLocation, profileTitle }: { profileLocation?: string; profileTitle?: string }) {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Check URL params for search query from career analysis
    const urlQuery = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') : null;
    const defaultQuery = urlQuery || profileTitle || 'software engineer';
    const country = extractCountry(profileLocation || '');
    const [searchInput, setSearchInput] = useState(defaultQuery);
    const [query, setQuery] = useState(defaultQuery);
    const [datePosted, setDatePosted] = useState('');
    const [remoteOnly, setRemoteOnly] = useState(false);
    const [employmentType, setEmploymentType] = useState('');
    const [experience, setExperience] = useState('');
    const [locationInput, setLocationInput] = useState(country);
    const [location, setLocation] = useState(country);
    const [page, setPage] = useState(1);
    const [appliedJobs, setAppliedJobs] = useState<{ company: string; role: string }[]>([]);

    // Load applied jobs on mount to show Applied badges
    useEffect(() => {
        getAppliedJobs().then(setAppliedJobs).catch(() => { });
    }, []);

    function isJobApplied(job: any): boolean {
        const employer = (job.employer_name || '').toLowerCase();
        const title = (job.job_title || '').toLowerCase();
        return appliedJobs.some(a =>
            employer.includes(a.company) || a.company.includes(employer) ||
            (title.includes(a.role) && employer.includes(a.company))
        );
    }

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ query, page: page.toString() });
            if (datePosted) params.set('date_posted', datePosted);
            if (remoteOnly) params.set('remote_only', 'true');
            if (employmentType) params.set('employment_type', employmentType);
            if (experience) params.set('job_requirements', experience);
            if (location) params.set('location', location);

            const res = await fetch(`/api/jobs?${params.toString()}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to fetch jobs');
                setJobs([]);
                return;
            }

            if (data.status === 'OK') {
                setJobs(data.data || []);
            } else {
                setError(data.error?.message || 'Unexpected API response');
                setJobs([]);
            }
        } catch {
            setError('Could not load jobs. Please try again.');
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }, [query, datePosted, remoteOnly, employmentType, experience, location, page]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setQuery(searchInput.trim());
            setLocation(locationInput.trim());
            setPage(1);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Hero header */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    <div className="flex items-center gap-3 mb-2">
                        <Zap className="h-8 w-8 text-yellow-300" />
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Find Jobs
                        </h1>
                    </div>
                    <p className="text-indigo-200 text-lg">
                        Real-time job listings with direct links to company application pages.
                    </p>

                    {/* Search bar */}
                    <form onSubmit={handleSearch} className="mt-8 flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Roles (comma separated), e.g. APM, Product Manager, BA..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 transition-all"
                            />
                        </div>
                        <div className="relative flex-1 min-w-[150px] max-w-xs">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Country (e.g. India, US...)"
                                value={locationInput}
                                onChange={(e) => setLocationInput(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3.5 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/20"
                        >
                            Search
                        </button>
                    </form>

                    {/* Filters row */}
                    <div className="mt-5 flex flex-wrap gap-3 items-center">
                        {/* Date posted */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            {DATE_FILTERS.map((f) => (
                                <button
                                    key={f.value}
                                    onClick={() => { setDatePosted(f.value); setPage(1); }}
                                    className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all
                                        ${datePosted === f.value
                                            ? 'bg-white text-indigo-700 shadow-md'
                                            : 'bg-white/10 text-indigo-100 hover:bg-white/20 border border-white/10'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <div className="h-6 w-px bg-white/20 hidden sm:block" />

                        {/* Remote toggle */}
                        <button
                            onClick={() => { setRemoteOnly(!remoteOnly); setPage(1); }}
                            className={`px-4 py-2 text-sm font-medium rounded-full flex items-center gap-2 transition-all
                                ${remoteOnly
                                    ? 'bg-white text-indigo-700 shadow-md'
                                    : 'bg-white/10 text-indigo-100 hover:bg-white/20 border border-white/10'
                                }`}
                        >
                            <Globe className="h-3.5 w-3.5" />
                            Remote Only
                        </button>

                        {/* Employment type */}
                        <select
                            value={employmentType}
                            onChange={(e) => { setEmploymentType(e.target.value); setPage(1); }}
                            className="px-4 py-2 text-sm font-medium rounded-full bg-white/10 text-indigo-100 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none cursor-pointer"
                        >
                            {EMPLOYMENT_TYPES.map((t) => (
                                <option key={t.value} value={t.value} className="text-slate-900">
                                    {t.label}
                                </option>
                            ))}
                        </select>

                        {/* Experience level */}
                        <select
                            value={experience}
                            onChange={(e) => { setExperience(e.target.value); setPage(1); }}
                            className="px-4 py-2 text-sm font-medium rounded-full bg-white/10 text-indigo-100 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none cursor-pointer"
                        >
                            {EXPERIENCE_LEVELS.map((t) => (
                                <option key={t.value} value={t.value} className="text-slate-900">
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Results count */}
                {!loading && !error && (
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-[var(--text-tertiary)] font-medium">
                            <span className="text-[var(--text-primary)] font-semibold">{jobs.length}</span> jobs found
                            {query && <> for "<span className="text-[var(--accent)]">{query}</span>"</>}
                            {location && <> in "<span className="text-[var(--accent)]">{location}</span>"</>}
                        </p>
                        {jobs.length > 0 && (
                            <div className="flex gap-2">
                                {page > 1 && (
                                    <button onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm font-medium bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]">
                                        ← Previous
                                    </button>
                                )}
                                <span className="px-3 py-1.5 text-sm text-[var(--text-tertiary)]">Page {page}</span>
                                <button onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm font-medium bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]">
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 text-[var(--accent)] animate-spin mb-4" />
                        <p className="text-[var(--text-tertiary)] font-medium">Searching jobs...</p>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <AlertCircle className="h-10 w-10 text-[var(--danger)] mb-4" />
                        <p className="text-[var(--text-primary)] font-medium mb-2">{error}</p>
                        <button
                            onClick={fetchJobs}
                            className="text-sm text-[var(--accent-text)] hover:opacity-80 font-medium"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && jobs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Briefcase className="h-12 w-12 text-[var(--text-tertiary)] mb-4" />
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">No jobs found</h3>
                        <p className="text-[var(--text-secondary)]">Try different keywords or broaden your filters.</p>
                    </div>
                )}

                {/* Job grid */}
                {!loading && !error && jobs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {jobs.map((job: any) => (
                            <JobCard key={job.job_id} job={job} isApplied={isJobApplied(job)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
