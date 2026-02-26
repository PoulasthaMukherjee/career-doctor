import { getDashboardData } from '@/lib/actions';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  Activity,
  Target,
  TrendingUp,
  Briefcase,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  FileText,
  Sparkles
} from 'lucide-react';
import CareerIntelligence from '@/components/CareerIntelligence';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const data = await getDashboardData(session.user.id);
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  const hasProfile = !!profile && !!(profile.fullName || profile.skills || profile.experience);

  const { metrics, diagnoses, prescriptions, funnel, aiInsights } = data;

  if (!metrics) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-8">
        <main className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Welcome to CareerDoctor</h2>
            <p className="text-[var(--text-secondary)] mb-6">No applications logged yet. Start by searching for jobs!</p>
            <div className="flex gap-3">
              <a href="/jobs" className="bg-[var(--accent)] text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">Find Jobs</a>
              <a href="/applications" className="bg-[var(--bg-secondary)] text-[var(--text-primary)] px-6 py-2.5 rounded-lg font-medium border border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors">Log Manually</a>
            </div>
          </div>

          {/* Career Intelligence even without applications */}
          <CareerIntelligence hasProfile={hasProfile} />
        </main>
      </div>
    );
  }

  const interviewRate = Math.round(metrics.overallResponseRate * 100);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Dashboard</h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">AI-driven insights based on your profile &amp; applications.</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Response Rate</p>
            <p className="text-3xl font-semibold text-[var(--accent)]">
              {interviewRate}%
            </p>
          </div>
        </div>

        {/* Career Intelligence */}
        <CareerIntelligence hasProfile={hasProfile} />

        {/* Application Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Funnel Conversion */}
          <div className="col-span-1 lg:col-span-2 bg-[var(--bg-secondary)] rounded-xl shadow-[var(--card-shadow)] border border-[var(--border)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--text-primary)]">
                <Target className="h-5 w-5 text-[var(--text-tertiary)]" />
                Funnel Conversion
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:justify-between sm:items-center gap-4 sm:gap-0 bg-[var(--bg-tertiary)] rounded-lg p-4 sm:p-6 border border-[var(--border)]">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">{funnel.applied}</p>
                <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Applied</p>
              </div>
              <ArrowRight className="h-5 w-5 text-[var(--text-tertiary)] hidden sm:block" />
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">{funnel.viewed}</p>
                <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Viewed</p>
              </div>
              <ArrowRight className="h-5 w-5 text-[var(--text-tertiary)] hidden sm:block" />
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[var(--accent)] mb-1">{funnel.responded}</p>
                <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Responses</p>
              </div>
              <ArrowRight className="h-5 w-5 text-[var(--text-tertiary)] hidden sm:block" />
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[var(--success)] mb-1">{funnel.interview}</p>
                <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Interviews</p>
              </div>
            </div>
          </div>

          {/* AI Insights / Improvement card */}
          <div className="col-span-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white flex flex-col justify-between">
            <div>
              {aiInsights ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                    <h2 className="text-lg font-medium opacity-90">AI Insights</h2>
                  </div>
                  <p className="text-xl font-bold leading-snug">{aiInsights.headline}</p>
                  <p className="text-indigo-100 mt-3 text-sm leading-relaxed">{aiInsights.insight}</p>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-medium opacity-90">Response Rate</h2>
                  <p className="text-5xl font-bold mt-4">{interviewRate}%</p>
                  <p className="text-indigo-100 mt-2 text-sm leading-relaxed">
                    {interviewRate > 30 ? "Great job! Your strategy is paying off." :
                      interviewRate > 15 ? "Good progress. Keep applying to targeted roles." :
                        "Focus on quality over quantity. Use targeted applications."}
                  </p>
                </>
              )}
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-medium bg-white/20 w-max px-3 py-1.5 rounded-full backdrop-blur-sm">
              <TrendingUp className="h-4 w-4" /> Goal: 30% Response Rate
            </div>
          </div>

        </div>

        {/* AI Tips (if available) */}
        {aiInsights?.tips && aiInsights.tips.length > 0 && (
          <div className="bg-[var(--accent-light)] rounded-xl border border-[var(--border)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">AI-Powered Tips</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiInsights.tips.map((tip: string, i: number) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <span className="text-[var(--accent)] font-bold text-sm mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-[var(--text-secondary)]">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Diagnosis Section */}
          <div className="bg-[var(--bg-secondary)] rounded-xl shadow-[var(--card-shadow)] border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-[var(--text-primary)]">
              <AlertTriangle className="h-5 w-5 text-[var(--warning)]" />
              Behavior Diagnosis
            </h2>
            <div className="space-y-4">
              {diagnoses.length === 0 && (
                <p className="text-[var(--text-secondary)] text-sm">Not enough data to diagnose behavior yet.</p>
              )}
              {diagnoses.map((d, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-lg bg-[var(--warning-light)] border border-[var(--border)] transition-all hover:shadow-sm">
                  <div className="mt-0.5">
                    {d.metric === 'applySpeed' && <Clock className="h-5 w-5 text-[var(--warning)]" />}
                    {d.metric === 'companySize' && <Building2 className="h-5 w-5 text-[var(--warning)]" />}
                    {d.metric === 'resumeVersion' && <FileText className="h-5 w-5 text-[var(--warning)]" />}
                    {d.metric === 'roleCluster' && <Briefcase className="h-5 w-5 text-[var(--warning)]" />}
                    {d.metric === 'source' && <Activity className="h-5 w-5 text-[var(--warning)]" />}
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                    {d.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Prescription Section */}
          <div className="bg-[var(--bg-secondary)] rounded-xl shadow-[var(--card-shadow)] border border-[var(--border)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--text-primary)]">
                <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
                Prescribed Plan
              </h2>
              <span className="text-xs font-semibold bg-[var(--success-light)] text-[var(--success)] px-2.5 py-1 rounded-full">
                This Week
              </span>
            </div>

            <div className="space-y-3">
              {prescriptions.map((p, i) => (
                <label key={i} className="flex items-start gap-4 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer group">
                  <div className="flex items-center h-5">
                    <input type="checkbox" className="w-4 h-4 accent-[var(--accent)] bg-[var(--bg-tertiary)] border-[var(--border)] rounded focus:ring-2" />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] leading-tight">
                    {p.task}
                  </p>
                </label>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
