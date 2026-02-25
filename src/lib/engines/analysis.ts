import { Application, Prisma } from '@prisma/client';

export type Outcome = "IGNORED" | "OA" | "INTERVIEW" | "OFFER";

// Since we're separating DB fetch from logic, we define a type that matches the Prisma schema
export type ApplicationInput = {
    outcome: Outcome;
    companySize?: string | null;
    role?: string | null;
    source?: string | null;
    daysSincePosted?: number | null;
    resume?: { version: string } | null;
};

export type AnalysisMetrics = {
    overallResponseRate: number;
    responseRateByCompanySize: Record<string, number>;
    responseRateByRoleCluster: Record<string, number>;
    responseRateBySource: Record<string, number>;
    responseRateByApplySpeed: Record<string, number>; // '<24h', '24h-48h', '>48h'
    responseRateByResumeVersion: Record<string, number>;
};

function isResponse(outcome: Outcome): boolean {
    return outcome === "OA" || outcome === "INTERVIEW" || outcome === "OFFER";
}

function calculateRate(total: number, responses: number): number {
    if (total === 0) return 0;
    return responses / total;
}

export function computeMetrics(applications: ApplicationInput[]): AnalysisMetrics {
    let totalApplications = 0;
    let totalResponses = 0;

    const stats = {
        companySize: {} as Record<string, { total: number; responses: number }>,
        roleCluster: {} as Record<string, { total: number; responses: number }>,
        source: {} as Record<string, { total: number; responses: number }>,
        applySpeed: {
            '<24h': { total: 0, responses: 0 },
            '24h-48h': { total: 0, responses: 0 },
            '>48h': { total: 0, responses: 0 },
            'unknown': { total: 0, responses: 0 },
        },
        resumeVersion: {} as Record<string, { total: number; responses: number }>,
    };

    for (const app of applications) {
        totalApplications++;
        const responded = isResponse(app.outcome);
        if (responded) totalResponses++;

        // Company Size
        if (app.companySize) {
            if (!stats.companySize[app.companySize]) stats.companySize[app.companySize] = { total: 0, responses: 0 };
            stats.companySize[app.companySize].total++;
            if (responded) stats.companySize[app.companySize].responses++;
        }

        // Role Cluster
        if (app.role) {
            // Basic clustering by keywords
            const roleLower = app.role.toLowerCase();
            let cluster = 'Other';
            if (roleLower.includes('frontend') || roleLower.includes('ui')) cluster = 'Frontend';
            else if (roleLower.includes('backend') || roleLower.includes('api')) cluster = 'Backend';
            else if (roleLower.includes('fullstack') || roleLower.includes('full stack')) cluster = 'Fullstack';
            else if (roleLower.includes('data') || roleLower.includes('machine learning')) cluster = 'Data';

            if (!stats.roleCluster[cluster]) stats.roleCluster[cluster] = { total: 0, responses: 0 };
            stats.roleCluster[cluster].total++;
            if (responded) stats.roleCluster[cluster].responses++;
        }

        // Source
        if (app.source) {
            if (!stats.source[app.source]) stats.source[app.source] = { total: 0, responses: 0 };
            stats.source[app.source].total++;
            if (responded) stats.source[app.source].responses++;
        }

        // Apply Speed
        if (app.daysSincePosted !== null && app.daysSincePosted !== undefined) {
            const days = app.daysSincePosted;
            let bucket = 'unknown';
            if (days <= 1) bucket = '<24h';
            else if (days <= 2) bucket = '24h-48h';
            else bucket = '>48h';

            stats.applySpeed[bucket as keyof typeof stats.applySpeed].total++;
            if (responded) stats.applySpeed[bucket as keyof typeof stats.applySpeed].responses++;
        }

        // Resume Version
        if (app.resume?.version) {
            const v = app.resume.version;
            if (!stats.resumeVersion[v]) stats.resumeVersion[v] = { total: 0, responses: 0 };
            stats.resumeVersion[v].total++;
            if (responded) stats.resumeVersion[v].responses++;
        }
    }

    // Convert raw counts to rates
    const toRates = (record: Record<string, { total: number; responses: number }>) => {
        const result: Record<string, number> = {};
        for (const [key, val] of Object.entries(record)) {
            if (val.total > 0) result[key] = calculateRate(val.total, val.responses);
        }
        return result;
    };

    return {
        overallResponseRate: calculateRate(totalApplications, totalResponses),
        responseRateByCompanySize: toRates(stats.companySize),
        responseRateByRoleCluster: toRates(stats.roleCluster),
        responseRateBySource: toRates(stats.source),
        responseRateByApplySpeed: toRates(stats.applySpeed),
        responseRateByResumeVersion: toRates(stats.resumeVersion),
    };
}
