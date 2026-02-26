'use client';

import { useState, useEffect } from 'react';
import { getCareerAnalysis, type CareerAnalysis } from '@/lib/career-analysis';
import {
    Sparkles, Target, TrendingUp, Zap, BookOpen, Compass,
    ArrowRight, Award, ChevronRight, RefreshCw, Brain,
    Building2, Briefcase, GraduationCap, AlertCircle, CheckCircle2, Share2
} from 'lucide-react';
import DiagnosisReport from './DiagnosisReport';

const cardClass = "bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6";
const STORAGE_KEY = 'career-analysis-cache';

function ProgressBar({ value, color = 'var(--accent)', height = 8, showLabel = false }: { value: number; color?: string; height?: number; showLabel?: boolean }) {
    return (
        <div className="relative w-full">
            <div className="w-full rounded-full overflow-hidden" style={{ height, background: 'var(--bg-tertiary)' }}>
                <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
            </div>
            {showLabel && <span className="absolute -top-5 text-xs font-bold" style={{ left: `${Math.min(95, value)}%`, color }}>{value}%</span>}
        </div>
    );
}

function ScoreBadge({ score }: { score: number }) {
    const color = score >= 85 ? '#22c55e' : score >= 65 ? '#6366f1' : score >= 45 ? '#eab308' : '#ef4444';
    return (
        <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-tertiary)" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${(score / 100) * 213.6} 213.6`} className="transition-all duration-1000" />
            </svg>
            <span className="absolute text-xl font-bold" style={{ color }}>{score}</span>
        </div>
    );
}

function PriorityBadge({ priority }: { priority: string }) {
    const styles: Record<string, string> = {
        high: 'bg-red-500/15 text-red-400 border-red-500/20',
        critical: 'bg-red-500/15 text-red-400 border-red-500/20',
        medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
        recommended: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
        low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
        'nice-to-have': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    };
    return (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${styles[priority] || styles.low}`}>
            {priority}
        </span>
    );
}

export default function CareerIntelligence({ hasProfile }: { hasProfile: boolean }) {
    const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showReport, setShowReport] = useState(false);

    // Load cached analysis from localStorage on mount
    useEffect(() => {
        try {
            const cached = localStorage.getItem(STORAGE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && parsed.headline) setAnalysis(parsed);
            }
        } catch { /* ignore parse errors */ }

        const handleProfileUpdate = () => {
            runAnalysis();
        };

        window.addEventListener('profile-updated', handleProfileUpdate);
        return () => window.removeEventListener('profile-updated', handleProfileUpdate);
    }, []);

    async function runAnalysis() {
        setLoading(true);
        setError('');
        try {
            const result = await getCareerAnalysis();
            if (result) {
                setAnalysis(result);
                // Persist to localStorage so it survives tab switches
                localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
            } else {
                setError('Could not generate analysis. Check your profile data and try again.');
            }
        } catch {
            setError('AI analysis failed. API quota may be exhausted.');
        }
        setLoading(false);
    }

    if (!hasProfile) {
        return (
            <div className={cardClass + " text-center py-12"}>
                <Brain className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Career Intelligence</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">Fill out your <a href="/profile" className="text-[var(--accent)] underline">profile</a> first to unlock AI career analysis.</p>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10 rounded-xl border border-[var(--border)] p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Career Intelligence Engine</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                    Get a deep AI analysis of your skills, best-fit roles, salary expectations, skill gaps, and a personalized career roadmap.
                </p>
                {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
                <button onClick={runAnalysis} disabled={loading} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/25">
                    {loading ? <><RefreshCw className="h-5 w-5 animate-spin" /> Analyzing your profile...</> : <><Sparkles className="h-5 w-5" /> Run Career Analysis</>}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Headline + Refresh */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Brain className="h-5 w-5 text-[var(--accent)]" />
                        <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest">Career Intelligence</span>
                    </div>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">{analysis.headline}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowReport(true)} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
                        <Share2 className="h-3.5 w-3.5" /> <span className="hidden md:inline">Share Report</span>
                    </button>
                    <button onClick={runAnalysis} disabled={loading} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors whitespace-nowrap">
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> <span className="hidden md:inline">Re-analyze</span>
                    </button>
                </div>
            </div>

            {/* Experience Breakdown + Profile Strength + Career Trajectory */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Experience Breakdown */}
                {'experienceBreakdown' in analysis && analysis.experienceBreakdown && (
                    <div className={cardClass}>
                        <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3 flex items-center gap-2"><Briefcase className="h-4 w-4" /> Experience</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-3xl font-bold text-[var(--accent)]">{analysis.experienceBreakdown.effectiveYOE}<span className="text-base font-medium text-[var(--text-tertiary)]"> YOE</span></div>
                            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20">{analysis.experienceBreakdown.level}</span>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center"><span className="text-[var(--text-secondary)]">Full-time</span><span className="font-bold text-[var(--text-primary)]">{analysis.experienceBreakdown.fullTimeYears} yr{analysis.experienceBreakdown.fullTimeYears !== 1 ? 's' : ''}</span></div>
                            <div className="flex justify-between items-center"><span className="text-[var(--text-secondary)]">Internships</span><span className="font-bold text-[var(--text-primary)]">{analysis.experienceBreakdown.internshipMonths} mo</span></div>
                            <div className="flex justify-between items-center"><span className="text-[var(--text-secondary)]">Student Activities</span><span className="font-bold text-[var(--text-primary)]">{analysis.experienceBreakdown.studentActivitiesMonths} mo</span></div>
                        </div>
                        <p className="text-[10px] text-[var(--text-tertiary)] mt-3 italic leading-relaxed">{analysis.experienceBreakdown.levelRationale}</p>
                    </div>
                )}

                {/* Profile Strength */}
                <div className={cardClass}>
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Profile Strength</h3>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">{analysis.profileStrength.label}</p>
                        </div>
                        <ScoreBadge score={analysis.profileStrength.score} />
                    </div>
                    {analysis.profileStrength.missing.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-2">Missing:</p>
                            <div className="flex flex-wrap gap-2">
                                {analysis.profileStrength.missing.map((m, i) => (
                                    <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{m}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Career Trajectory */}
                <div className={cardClass}>
                    <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Career Trajectory</h3>
                    <div className="relative pl-4 border-l-2 border-[var(--accent)]/30 space-y-4">
                        {[
                            { label: 'Now', value: analysis.careerTrajectory.current, active: true },
                            { label: '6 months', value: analysis.careerTrajectory.sixMonths },
                            { label: '1 year', value: analysis.careerTrajectory.oneYear },
                            { label: '3 years', value: analysis.careerTrajectory.threeYears },
                        ].map((step, i) => (
                            <div key={i} className="relative">
                                <div className={`absolute -left-[22px] w-3 h-3 rounded-full border-2 ${step.active ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-[var(--bg-secondary)] border-[var(--accent)]/40'}`} />
                                <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">{step.label}</p>
                                <p className={`text-sm font-semibold ${step.active ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>{step.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Skill Categories */}
            <div className={cardClass}>
                <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-5 flex items-center gap-2"><Zap className="h-4 w-4" /> Skill Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {analysis.skillCategories.map((cat, i) => (
                        <div key={i}>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm font-semibold text-[var(--text-primary)]">{cat.name}</span>
                                <span className="text-xs font-bold" style={{ color: cat.strength >= 75 ? '#22c55e' : cat.strength >= 50 ? '#6366f1' : '#eab308' }}>{cat.strength}%</span>
                            </div>
                            <ProgressBar value={cat.strength} color={cat.strength >= 75 ? '#22c55e' : cat.strength >= 50 ? '#6366f1' : '#eab308'} />
                            <p className="text-xs text-[var(--text-tertiary)] mt-1.5">{cat.skills.join(' · ')}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Role Matches */}
            <div className={cardClass}>
                <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-5 flex items-center gap-2"><Target className="h-4 w-4" /> Best Role Matches</h3>
                <div className="space-y-3">
                    {analysis.roleMatches.map((role, i) => (
                        <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-colors group">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                    <span className="text-sm font-bold text-[var(--accent)]">#{i + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-[var(--text-primary)] text-sm">{role.title}</p>
                                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">{role.matchScore}% match</span>
                                        {'levelAppropriate' in role && !role.levelAppropriate && <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">STRETCH</span>}
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{role.reason}</p>
                                </div>
                            </div>
                            <div className="text-left sm:text-right flex-shrink-0 ml-auto">
                                <p className="text-sm font-bold text-[var(--text-primary)]">{role.salaryRange}</p>
                                <p className="text-[10px] text-[var(--text-tertiary)] uppercase">Estimated</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skill Gaps + Action Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gap Analysis */}
                <div className={cardClass}>
                    <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-5 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Skill Gap Analysis</h3>
                    <div className="space-y-3">
                        {analysis.gapAnalysis.map((gap, i) => (
                            <div key={i} className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-semibold text-sm text-[var(--text-primary)]">{gap.skill}</span>
                                    <PriorityBadge priority={gap.importance} />
                                </div>
                                <p className="text-xs text-[var(--text-secondary)]">
                                    Needed for: {gap.forRoles.join(', ')}
                                </p>
                                <p className="text-xs text-[var(--text-tertiary)] mt-1 flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" /> Learn time: {gap.learnTime}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Items */}
                <div className={cardClass}>
                    <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-5 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Action Plan</h3>
                    <div className="space-y-3">
                        {analysis.actionItems.map((item, i) => (
                            <div key={i} className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-sm font-semibold text-[var(--text-primary)]">{item.action}</p>
                                    <PriorityBadge priority={item.priority} />
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                                    <Zap className="h-3 w-3 text-amber-400" /> {item.impact}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Industry Fit */}
            <div className={cardClass}>
                <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-5 flex items-center gap-2"><Building2 className="h-4 w-4" /> Industry Fit</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {analysis.industryFit.map((ind, i) => (
                        <div key={i} className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-center">
                            <div className="mx-auto mb-3" style={{ width: '56px' }}><ScoreBadge score={ind.fitScore} /></div>
                            <p className="text-sm font-bold text-[var(--text-primary)]">{ind.industry}</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">{ind.reason}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommended Search Queries */}
            {'searchQueries' in analysis && analysis.searchQueries && analysis.searchQueries.length > 0 && (
                <div className={cardClass}>
                    <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-4 flex items-center gap-2"><Compass className="h-4 w-4" /> Recommended Job Searches</h3>
                    <p className="text-xs text-[var(--text-secondary)] mb-3">Click any search term to find matching jobs:</p>
                    <div className="flex flex-wrap gap-2">
                        {analysis.searchQueries.map((q: string, i: number) => (
                            <a key={i} href={`/jobs?q=${encodeURIComponent(q)}`} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/10 transition-all">
                                <Briefcase className="h-3.5 w-3.5" /> {q}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Shareable Report Modal */}
            {showReport && (
                <DiagnosisReport
                    analysis={analysis}
                    onClose={() => setShowReport(false)}
                />
            )}
        </div>
    );
}
