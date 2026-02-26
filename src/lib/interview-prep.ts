'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askAI } from "./ai";

export type InterviewQuestion = {
    question: string;
    suggestedAnswer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string; // e.g. "Behavioral", "Technical", "Situational", "Role-specific"
};

export type InterviewPrep = {
    questions: InterviewQuestion[];
    redFlags: string[];
    tips: string[];
};

export async function generateInterviewPrep(jobDescription: string): Promise<InterviewPrep | null> {
    const session = await auth();
    if (!session?.user?.id) return null;

    const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return null;

    const skills = profile.skills ? JSON.parse(profile.skills) : [];
    const experience = profile.experience ? JSON.parse(profile.experience) : [];
    const education = profile.education ? JSON.parse(profile.education) : [];
    const projects = profile.projects ? JSON.parse(profile.projects) : [];

    const profileSummary = JSON.stringify({
        name: profile.fullName, title: profile.title,
        summary: profile.summary, skills, experience, education, projects,
    });

    const prompt = `You are a senior interview coach. A candidate is preparing for an interview.

CANDIDATE PROFILE:
${profileSummary}

JOB DESCRIPTION:
${jobDescription}

Generate interview preparation in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):
{
  "questions": [
    {
      "question": "Tell me about a time you handled a difficult stakeholder",
      "suggestedAnswer": "A detailed STAR-format answer using REAL examples from the candidate's actual experience. Reference specific companies, projects, and skills from their profile. Make it sound natural and conversational, not robotic.",
      "difficulty": "medium",
      "category": "Behavioral"
    }
  ],
  "redFlags": [
    "Interviewer may ask about lack of X skill which is listed in the JD but not in the profile"
  ],
  "tips": [
    "Research the company's recent product launches before the interview"
  ]
}

RULES:
- Generate exactly 10 questions
- Mix categories: 3 Behavioral, 3 Technical/Role-specific, 2 Situational, 2 Culture-fit
- Suggested answers MUST reference the candidate's ACTUAL experience, companies, and projects from their profile
- Use STAR format (Situation, Task, Action, Result) for behavioral answers
- For technical questions, reference their actual tech stack and projects
- Red flags: identify 3-5 areas where the candidate's profile doesn't match the JD
- Tips: give 3-5 actionable preparation tips specific to this role
- Difficulty should reflect how challenging the question is for THIS candidate based on their experience level`;

    const result = await askAI(prompt);
    if (!result) return null;

    try {
        const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
    } catch {
        console.error('Failed to parse interview prep:', result);
        return null;
    }
}
