'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askAI } from "./ai";

export type DigestData = {
    tipOfTheDay: {
        title: string;
        tip: string;
        category: string; // e.g. "Profile", "Networking", "Skills", "Strategy"
    };
    skillSpotlight: {
        skill: string;
        why: string;
        freeResources: { name: string; url: string; type: string }[];
    };
    pipelineStatus: {
        total: number;
        applied: number;
        interviewing: number;
        offered: number;
        needsAction: string[]; // e.g. "Follow up with Company X (applied 2 weeks ago)"
    };
};

export async function getDigestData(userId: string): Promise<DigestData | null> {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    const applications = await prisma.application.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
    });

    // Pipeline stats
    const applied = applications.filter(a => a.outcome === 'IGNORED').length; // Applied, no response yet
    const interviewing = applications.filter(a => a.outcome === 'INTERVIEW' || a.outcome === 'OA').length;
    const offered = applications.filter(a => a.outcome === 'OFFER').length;

    // Applications that need follow-up (IGNORED > 7 days ago)
    const staleApps = applications
        .filter(a => a.outcome === 'IGNORED' && a.updatedAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .slice(0, 3)
        .map(a => `Follow up with ${a.company} for ${a.role} (applied ${Math.floor((Date.now() - a.updatedAt.getTime()) / (1000 * 60 * 60 * 24))} days ago)`);

    const skills = profile?.skills ? JSON.parse(profile.skills) : [];
    const title = profile?.title || 'professional';

    // Generate daily tip and skill spotlight via AI
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

    const prompt = `You are a career coach. Generate a daily career tip and skill learning recommendation.

Context:
- Candidate title: ${title}
- Skills they have: ${skills.join(', ')}
- Day number: ${dayOfYear} (use this to vary your response — give a DIFFERENT tip each day)
- They have ${applications.length} total applications, ${applied} pending, ${interviewing} in interview stage

Return EXACTLY this JSON format (no markdown, no code blocks):
{
  "tipOfTheDay": {
    "title": "Short catchy title for the tip",
    "tip": "2-3 sentences of actionable advice. Be specific, not generic.",
    "category": "Profile" or "Networking" or "Skills" or "Strategy" or "Interview"
  },
  "skillSpotlight": {
    "skill": "A useful skill they should learn next based on their profile",
    "why": "1-2 sentences explaining why this skill matters for their career",
    "freeResources": [
      {"name": "Resource name", "url": "https://actual-url.com", "type": "Course" or "Tutorial" or "Documentation" or "Video"}
    ]
  }
}

Rules:
- Tip must be ACTIONABLE and SPECIFIC to their role, not generic
- Skill should be something they DON'T already have but would benefit from
- Free resources MUST be real, existing, free URLs (freeCodeCamp, MDN, YouTube, Coursera free courses, etc.)
- Give 2-3 free resources`;

    const result = await askAI(prompt);
    if (!result) return null;

    try {
        const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const aiData = JSON.parse(cleaned);

        return {
            tipOfTheDay: aiData.tipOfTheDay,
            skillSpotlight: aiData.skillSpotlight,
            pipelineStatus: {
                total: applications.length,
                applied,
                interviewing,
                offered,
                needsAction: staleApps,
            },
        };
    } catch {
        console.error('Failed to parse digest:', result);
        return null;
    }
}

export async function getDigest(): Promise<DigestData | null> {
    const session = await auth();
    if (!session?.user?.id) return null;
    return getDigestData(session.user.id);
}
