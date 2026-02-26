'use client';

import { useState } from 'react';
import { generateInterviewPrep, type InterviewPrep, type InterviewQuestion } from '@/lib/interview-prep';
import {
    Mic, ChevronDown, ChevronUp, AlertTriangle, Lightbulb,
    Sparkles, RefreshCw, Eye, EyeOff, BookOpen, Clipboard, Check
} from 'lucide-react';

const difficultyColor: Record<string, string> = {
    easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    hard: 'bg-red-500/15 text-red-400 border-red-500/20',
};

const categoryColor: Record<string, string> = {
    Behavioral: 'text-indigo-400',
    Technical: 'text-cyan-400',
    'Role-specific': 'text-purple-400',
    Situational: 'text-amber-400',
    'Culture-fit': 'text-pink-400',
};

function QuestionCard({ q, index, practiceMode }: { q: InterviewQuestion; index: number; practiceMode: boolean }) {
    const [expanded, setExpanded] = useState(!practiceMode);
    const [copied, setCopied] = useState(false);

    const copyAnswer = () => {
        navigator.clipboard.writeText(q.suggestedAnswer);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-start gap-4 p-5 text-left hover:bg-[var(--bg-tertiary)] transition-colors"
            >
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-sm font-bold text-[var(--accent)]">
                    {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--text-primary)] text-sm leading-relaxed">{q.question}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${difficultyColor[q.difficulty] || difficultyColor.medium}`}>
                            {q.difficulty}
                        </span>
                        <span className={`text-[10px] font-semibold ${categoryColor[q.category] || 'text-slate-400'}`}>
                            {q.category}
                        </span>
                    </div>
                </div>
                {practiceMode ? (
                    expanded ? <EyeOff className="h-4 w-4 text-[var(--text-tertiary)] mt-1 flex-shrink-0" /> : <Eye className="h-4 w-4 text-[var(--text-tertiary)] mt-1 flex-shrink-0" />
                ) : (
                    expanded ? <ChevronUp className="h-4 w-4 text-[var(--text-tertiary)] mt-1 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)] mt-1 flex-shrink-0" />
                )}
            </button>

            {expanded && (
                <div className="px-5 pb-5 pt-0">
                    <div className="ml-12 p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border)]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Suggested Answer</span>
                            <button onClick={copyAnswer} className="text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors">
                                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Clipboard className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{q.suggestedAnswer}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function InterviewPrepClient() {
    const [jobDescription, setJobDescription] = useState('');
    const [prep, setPrep] = useState<InterviewPrep | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [practiceMode, setPracticeMode] = useState(false);

    async function handleGenerate() {
        if (!jobDescription.trim()) return;
        setLoading(true);
        setError('');
        try {
            const result = await generateInterviewPrep(jobDescription);
            if (result) {
                setPrep(result);
            } else {
                setError('Could not generate interview prep. Check your profile and try again.');
            }
        } catch {
            setError('AI failed. Try again.');
        }
        setLoading(false);
    }

    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Mic className="h-5 w-5 text-[var(--accent)]" />
                    <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest">Interview Prep</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">Ace Your Next Interview</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Paste a job description and get AI-coached answers tailored to your actual experience.</p>
            </div>

            {/* Input */}
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-3 block">Job Description</label>
                <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here... (title, responsibilities, requirements, etc.)"
                    rows={6}
                    className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] resize-none focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
                {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
                <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-[var(--text-tertiary)]">
                        {jobDescription.length > 0 ? `${jobDescription.split(/\s+/).length} words` : 'Tip: Include the full JD for best results'}
                    </p>
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !jobDescription.trim()}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 text-sm"
                    >
                        {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Questions</>}
                    </button>
                </div>
            </div>

            {/* Results */}
            {prep && (
                <div className="space-y-6">
                    {/* Practice Toggle */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                            {prep.questions.length} Interview Questions
                        </h2>
                        <button
                            onClick={() => setPracticeMode(!practiceMode)}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${practiceMode
                                    ? 'bg-[var(--accent)] text-white'
                                    : 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)]'
                                }`}
                        >
                            <BookOpen className="h-3.5 w-3.5" />
                            {practiceMode ? 'Practice Mode ON' : 'Practice Mode'}
                        </button>
                    </div>

                    {practiceMode && (
                        <p className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-4 py-3">
                            💡 Answers are hidden. Click each question to think through your answer first, then reveal the coached response.
                        </p>
                    )}

                    {/* Questions */}
                    <div className="space-y-3">
                        {prep.questions.map((q, i) => (
                            <QuestionCard key={i} q={q} index={i} practiceMode={practiceMode} />
                        ))}
                    </div>

                    {/* Red Flags & Tips */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Red Flags */}
                        {prep.redFlags && prep.redFlags.length > 0 && (
                            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
                                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" /> Watch Out
                                </h3>
                                <div className="space-y-3">
                                    {prep.redFlags.map((flag, i) => (
                                        <div key={i} className="flex gap-3 text-sm">
                                            <span className="text-red-400 mt-0.5 flex-shrink-0">⚠</span>
                                            <p className="text-[var(--text-secondary)]">{flag}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tips */}
                        {prep.tips && prep.tips.length > 0 && (
                            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
                                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4" /> Pro Tips
                                </h3>
                                <div className="space-y-3">
                                    {prep.tips.map((tip, i) => (
                                        <div key={i} className="flex gap-3 text-sm">
                                            <span className="text-amber-400 mt-0.5 flex-shrink-0">💡</span>
                                            <p className="text-[var(--text-secondary)]">{tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
