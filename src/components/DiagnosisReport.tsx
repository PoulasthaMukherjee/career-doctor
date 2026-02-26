'use client';

import { useRef, useState } from 'react';
import { Download, X, Activity, TrendingUp, Target, Zap, Award, MapPin } from 'lucide-react';
import type { CareerAnalysis } from '@/lib/career-analysis';

type Props = {
    analysis: CareerAnalysis;
    userName?: string;
    onClose: () => void;
};

export default function DiagnosisReport({ analysis, userName, onClose }: Props) {
    const reportRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

    const downloadPng = async () => {
        if (!reportRef.current) return;
        setDownloading(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(reportRef.current, {
                backgroundColor: '#0f172a',
                scale: 2,
                useCORS: true,
            });
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = 'career-diagnosis.png';
            a.click();
        } finally {
            setDownloading(false);
        }
    };

    const strengthColor = analysis.profileStrength.score >= 80 ? '#22c55e' :
        analysis.profileStrength.score >= 60 ? '#eab308' : '#ef4444';

    const topRoles = analysis.roleMatches.slice(0, 3);
    const topSkills = analysis.skillCategories.slice(0, 4);
    const topIndustries = analysis.industryFit.slice(0, 3);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button
                    onClick={downloadPng}
                    disabled={downloading}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors text-sm disabled:opacity-50"
                >
                    <Download className="h-4 w-4" />
                    {downloading ? 'Saving...' : 'Download PNG'}
                </button>
                <button
                    onClick={onClose}
                    className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Report Card */}
            <div className="overflow-y-auto max-h-[90vh] rounded-2xl">
                <div
                    ref={reportRef}
                    className="w-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-8"
                    style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-400" />
                            <span className="font-bold text-sm tracking-wider text-indigo-400 uppercase">CareerDoctor</span>
                        </div>
                        <span className="text-xs text-slate-500">Career Diagnosis Report</span>
                    </div>

                    {/* Name + Headline */}
                    <div className="mb-8">
                        {userName && <h1 className="text-2xl font-bold mb-1">{userName}</h1>}
                        <p className="text-indigo-300 text-sm">{analysis.headline}</p>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {/* Profile Strength */}
                        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                            <div className="relative w-16 h-16 mx-auto mb-2">
                                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none" stroke={strengthColor} strokeWidth="3"
                                        strokeDasharray={`${analysis.profileStrength.score}, 100`}
                                        strokeLinecap="round" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{analysis.profileStrength.score}</span>
                            </div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Strength</p>
                        </div>

                        {/* Experience */}
                        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                            <p className="text-3xl font-bold text-white mb-1">{analysis.experienceBreakdown.effectiveYOE}</p>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Effective YOE</p>
                            <p className="text-xs text-indigo-400 mt-1 font-medium">{analysis.experienceBreakdown.level}</p>
                        </div>

                        {/* Top Match */}
                        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                            <p className="text-3xl font-bold text-emerald-400 mb-1">{topRoles[0]?.matchScore || 0}%</p>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Best Match</p>
                            <p className="text-xs text-emerald-400 mt-1 font-medium truncate">{topRoles[0]?.title || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Career Trajectory */}
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5" /> Career Trajectory
                        </h3>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-full border border-indigo-500/30 font-medium">
                                {analysis.careerTrajectory.current}
                            </span>
                            <span className="text-slate-600">→</span>
                            <span className="bg-white/5 text-slate-300 px-3 py-1.5 rounded-full border border-white/10">
                                {analysis.careerTrajectory.sixMonths}
                            </span>
                            <span className="text-slate-600">→</span>
                            <span className="bg-white/5 text-slate-300 px-3 py-1.5 rounded-full border border-white/10">
                                {analysis.careerTrajectory.oneYear}
                            </span>
                            <span className="text-slate-600">→</span>
                            <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/30 font-medium">
                                {analysis.careerTrajectory.threeYears}
                            </span>
                        </div>
                    </div>

                    {/* Role Matches */}
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Target className="h-3.5 w-3.5" /> Top Role Matches
                        </h3>
                        <div className="space-y-2">
                            {topRoles.map((role, i) => (
                                <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/20 w-6 h-6 rounded-full flex items-center justify-center">
                                            {i + 1}
                                        </span>
                                        <span className="font-medium text-sm">{role.title}</span>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-400">{role.matchScore}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Zap className="h-3.5 w-3.5" /> Skill Breakdown
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {topSkills.map((cat, i) => (
                                <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-medium text-slate-300">{cat.name}</span>
                                        <span className="text-xs font-bold text-indigo-400">{cat.strength}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                            style={{ width: `${cat.strength}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Industry Fit */}
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" /> Industry Fit
                        </h3>
                        <div className="flex gap-3">
                            {topIndustries.map((ind, i) => (
                                <div key={i} className="flex-1 bg-white/5 rounded-lg p-3 border border-white/10 text-center">
                                    <div className="relative w-10 h-10 mx-auto mb-2">
                                        <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3.5" />
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none" stroke={i === 0 ? '#818cf8' : i === 1 ? '#a78bfa' : '#c084fc'}
                                                strokeWidth="3.5"
                                                strokeDasharray={`${ind.fitScore}, 100`}
                                                strokeLinecap="round" />
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{ind.fitScore}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 font-medium leading-tight">{ind.industry}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5 text-indigo-400" />
                            <span className="text-[11px] font-semibold text-indigo-400">careerdoctor.app</span>
                        </div>
                        <span className="text-[10px] text-slate-600">
                            Diagnosed on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
