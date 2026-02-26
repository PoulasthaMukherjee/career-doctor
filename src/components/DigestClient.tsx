'use client';

import { useState, useEffect } from 'react';
import { getDigest, type DigestData } from '@/lib/digest';
import {
    Lightbulb, BookOpen, ArrowUpRight, Target, AlertCircle,
    Briefcase, CheckCircle, Clock, RefreshCw, Zap, ExternalLink
} from 'lucide-react';

const DIGEST_CACHE_KEY = 'career-digest-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default function DigestClient() {
    const [digest, setDigest] = useState<DigestData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDigest();
    }, []);

    async function loadDigest() {
        // Try cache first
        try {
            const cached = localStorage.getItem(DIGEST_CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION && data) {
                    setDigest(data);
                    setLoading(false);
                    return;
                }
            }
        } catch { /* ignore */ }

        // Fetch fresh
        setLoading(true);
        try {
            const result = await getDigest();
            if (result) {
                setDigest(result);
                localStorage.setItem(DIGEST_CACHE_KEY, JSON.stringify({ data: result, timestamp: Date.now() }));
            }
        } catch {
            console.error('Failed to load digest');
        }
        setLoading(false);
    }

    async function refreshDigest() {
        localStorage.removeItem(DIGEST_CACHE_KEY);
        setLoading(true);
        try {
            const result = await getDigest();
            if (result) {
                setDigest(result);
                localStorage.setItem(DIGEST_CACHE_KEY, JSON.stringify({ data: result, timestamp: Date.now() }));
            }
        } catch {
            console.error('Failed to refresh digest');
        }
        setLoading(false);
    }

    if (loading) {
        return (
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-[var(--bg-secondary)] rounded w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-48 bg-[var(--bg-secondary)] rounded-xl" />
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    if (!digest) {
        return (
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-12 text-center">
                    <Zap className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No digest available</h2>
                    <p className="text-sm text-[var(--text-secondary)]">Fill out your profile to get personalized daily insights.</p>
                </div>
            </main>
        );
    }

    const { tipOfTheDay, skillSpotlight, pipelineStatus } = digest;

    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-5 w-5 text-[var(--accent)]" />
                        <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest">Daily Digest</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">Your Career Pulse</h1>
                </div>
                <button
                    onClick={refreshDigest}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Tip of the Day */}
                <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-xl border border-[var(--border)] p-6">
                    <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-400" /> Tip of the Day
                    </h3>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 mb-3">
                        {tipOfTheDay.category}
                    </span>
                    <h4 className="text-base font-semibold text-[var(--text-primary)] mb-2">{tipOfTheDay.title}</h4>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{tipOfTheDay.tip}</p>
                </div>

                {/* Pipeline Status */}
                <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
                    <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Target className="h-4 w-4" /> Pipeline Status
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 text-center">
                            <Briefcase className="h-4 w-4 text-[var(--text-tertiary)] mx-auto mb-1" />
                            <p className="text-xl font-bold text-[var(--text-primary)]">{pipelineStatus.total}</p>
                            <p className="text-[10px] text-[var(--text-tertiary)] uppercase">Total</p>
                        </div>
                        <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 text-center">
                            <Clock className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                            <p className="text-xl font-bold text-amber-400">{pipelineStatus.applied}</p>
                            <p className="text-[10px] text-[var(--text-tertiary)] uppercase">Pending</p>
                        </div>
                        <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 text-center">
                            <ArrowUpRight className="h-4 w-4 text-indigo-400 mx-auto mb-1" />
                            <p className="text-xl font-bold text-indigo-400">{pipelineStatus.interviewing}</p>
                            <p className="text-[10px] text-[var(--text-tertiary)] uppercase">Interview</p>
                        </div>
                        <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 text-center">
                            <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                            <p className="text-xl font-bold text-emerald-400">{pipelineStatus.offered}</p>
                            <p className="text-[10px] text-[var(--text-tertiary)] uppercase">Offers</p>
                        </div>
                    </div>
                    {pipelineStatus.needsAction.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-amber-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Needs Follow-up</p>
                            {pipelineStatus.needsAction.map((action, i) => (
                                <p key={i} className="text-xs text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-lg px-3 py-2">{action}</p>
                            ))}
                        </div>
                    )}
                </div>

                {/* Skill Spotlight */}
                <div className="md:col-span-2 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
                    <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-cyan-400" /> Skill Spotlight
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-1">
                            <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-400" /> {skillSpotlight.skill}
                            </h4>
                            <p className="text-sm text-[var(--text-secondary)] mb-4">{skillSpotlight.why}</p>
                        </div>
                        <div className="sm:w-72 flex-shrink-0 space-y-2">
                            <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Free Resources</p>
                            {skillSpotlight.freeResources.map((res, i) => (
                                <a
                                    key={i}
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border)] hover:border-[var(--accent)]/50 transition-colors group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent)]">{res.name}</p>
                                        <p className="text-[10px] text-[var(--text-tertiary)] uppercase">{res.type}</p>
                                    </div>
                                    <ExternalLink className="h-3.5 w-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] flex-shrink-0" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
