import { AnalysisMetrics } from './analysis';

export type DiagnosisResult = {
    message: string;
    metric?: string;
};

export function runDiagnosis(metrics: AnalysisMetrics): DiagnosisResult[] {
    const diagnoses: DiagnosisResult[] = [];

    // Speed of application
    const rateUnder24h = metrics.responseRateByApplySpeed['<24h'] || 0;
    const rateOver48h = metrics.responseRateByApplySpeed['>48h'] || 0;
    if (rateUnder24h > 0 && rateOver48h > 0 && rateUnder24h > rateOver48h * 1.5) {
        diagnoses.push({
            message: `You apply too late. Applications within 24h have a significantly higher response rate (${Math.round(rateUnder24h * 100)}% vs ${Math.round(rateOver48h * 100)}%).`,
            metric: 'applySpeed'
        });
    } else if (metrics.responseRateByApplySpeed['>48h'] !== undefined && rateOver48h < 0.05) {
        diagnoses.push({
            message: 'Applications older than 48h are yielding very low conversions. Stop applying to stale jobs.',
            metric: 'applySpeed'
        });
    }

    // Company Size
    let bestSize = '';
    let bestSizeRate = 0;
    for (const [size, rate] of Object.entries(metrics.responseRateByCompanySize)) {
        if (rate > bestSizeRate) {
            bestSizeRate = rate;
            bestSize = size;
        }
    }
    if (bestSize && bestSizeRate > metrics.overallResponseRate * 1.2 && bestSizeRate > 0) {
        diagnoses.push({
            message: `You perform better with ${bestSize} companies. Focus your efforts there.`,
            metric: 'companySize'
        });
    }

    // Source (Easy Apply vs Others)
    const easyApplyRate = metrics.responseRateBySource['Easy Apply'] || 0;
    const referralRate = metrics.responseRateBySource['Referral'] || 0;
    const companySiteRate = metrics.responseRateBySource['Company Website'] || 0;
    if (easyApplyRate > 0 && Math.max(referralRate, companySiteRate) > easyApplyRate * 2) {
        diagnoses.push({
            message: 'You rely too much on Easy Apply but have much higher success through other channels.',
            metric: 'source'
        });
    }

    // Resume performance
    const versions = Object.entries(metrics.responseRateByResumeVersion);
    if (versions.length > 1) {
        versions.sort((a, b) => b[1] - a[1]);
        const bestResume = versions[0];
        const secondBest = versions[1];
        if (bestResume[1] > secondBest[1] * 1.5) {
            diagnoses.push({
                message: `${bestResume[0]} performs significantly better overall (${Math.round(bestResume[1] * 100)}% response rate).`,
                metric: 'resumeVersion'
            });
        }
    }

    // Role Cluster Oversaturation
    // We approximate this by looking for large application count with very low response rate
    // This would typically require full data (applications count from analysis), but since we only have rates, 
    // we can just check if rate is exceptionally low compared to overall.
    for (const [role, rate] of Object.entries(metrics.responseRateByRoleCluster)) {
        if (rate < 0.02 && rate < metrics.overallResponseRate * 0.5) {
            diagnoses.push({
                message: `You are targeting oversaturated roles in ${role}. The yield is extremely low.`,
                metric: 'roleCluster'
            });
        }
    }

    return diagnoses;
}
