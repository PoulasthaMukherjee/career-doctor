'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askGemini } from "./ai";
import { sendAnalysisEmail } from "./email";

export type CareerAnalysis = {
  experienceBreakdown: {
    fullTimeYears: number;
    internshipMonths: number;
    studentActivitiesMonths: number;
    effectiveYOE: number;       // Weighted: full-time counts fully, internships at 0.5x, student activities at 0.25x
    level: string;              // "Fresh Graduate", "Entry Level", "Junior", "Mid-Level", "Senior", etc.
    levelRationale: string;     // Explanation of why this level
  };
  profileStrength: {
    score: number;
    label: string;
    missing: string[];
  };
  skillCategories: {
    name: string;
    skills: string[];
    strength: number;
  }[];
  roleMatches: {
    title: string;
    matchScore: number;
    reason: string;
    salaryRange: string;
    levelAppropriate: boolean;  // Is this role appropriate for their experience level?
  }[];
  gapAnalysis: {
    skill: string;
    importance: 'critical' | 'recommended' | 'nice-to-have';
    forRoles: string[];
    learnTime: string;
  }[];
  careerTrajectory: {
    current: string;
    sixMonths: string;
    oneYear: string;
    threeYears: string;
  };
  industryFit: {
    industry: string;
    fitScore: number;
    reason: string;
  }[];
  actionItems: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    impact: string;
  }[];
  searchQueries: string[];         // Recommended job search queries for this person
  headline: string;
};

export async function getCareerAnalysis(): Promise<CareerAnalysis | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return null;

  const skills = profile.skills ? JSON.parse(profile.skills) : [];
  const experience = profile.experience ? JSON.parse(profile.experience) : [];
  const education = profile.education ? JSON.parse(profile.education) : [];
  const projects = profile.projects ? JSON.parse(profile.projects) : [];
  const certifications = profile.certifications ? JSON.parse(profile.certifications) : [];
  const achievements = profile.achievements ? JSON.parse(profile.achievements) : [];
  const links = profile.links ? JSON.parse(profile.links) : [];

  const filled = [profile.fullName, profile.title, profile.email, profile.summary, skills.length > 0, experience.length > 0, education.length > 0].filter(Boolean).length;
  if (filled < 3) return null;

  const profileData = JSON.stringify({
    name: profile.fullName, title: profile.title, location: profile.location,
    summary: profile.summary, skills, experience, education, projects,
    certifications, achievements, links,
  });

  const prompt = `You are a senior career strategist. Analyze this profile with DEEP LOGICAL THINKING.

TODAY'S DATE: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
IMPORTANT: "Present" or "Current" in any date field means TODAY'S DATE (${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}). Use this to calculate exact durations.

CRITICAL: EXPERIENCE CALCULATION RULES
Before doing anything else, classify each experience entry:
1. FULL-TIME EMPLOYMENT: Post-graduation jobs, full-time roles. Count actual years.
2. INTERNSHIPS: Pre/during college roles, usually 3-6 months. Count at 50% weight.
3. STUDENT ACTIVITIES: Clubs, councils, leadership programs during college. Count at 25% weight.
4. OVERLAPPING PERIODS: If someone did 2 internships simultaneously, DON'T double count. Take the calendar time, not the sum.
5. EDUCATION PERIOD: Identify graduation year from education. Everything before graduation is pre-experience.

EFFECTIVE YOE FORMULA:
- effectiveYOE = full_time_years + (internship_months * 0.5 / 12) + (student_months * 0.25 / 12)
- But overlapping internships/activities during the same college period = count calendar months only once at the higher weight

LEVEL CLASSIFICATION (based on effectiveYOE):
- 0-0.5 → "Fresh Graduate" 
- 0.5-1.5 → "Entry Level"
- 1.5-3 → "Junior"
- 3-6 → "Mid-Level"  
- 6-10 → "Senior"
- 10-15 → "Staff/Principal"
- 15+ → "Director/VP"

ROLE MATCHING RULES (CRITICAL - THINK LOGICALLY):
- DO NOT just recommend the person's current title at a higher level
- If someone has 1 YOE as Product Owner → recommend Associate PM, APM, Junior PM roles (60-80% match), and Product Owner at SMALLER companies (70% match). Do NOT recommend "Senior PM" (that needs 5+ YOE typically)
- If someone is a fresh graduate SDE → recommend Junior SDE, SDE-1, Graduate Engineer roles, NOT "Senior Engineer"
- Include both lateral moves AND step-up roles that are REALISTIC for their YOE
- Include "stretch" roles they could grow into in 6-12 months (mark these clearly)
- Salary ranges should match THEIR experience level, not the role's senior-level range
- SALARY CURRENCY: Use the LOCAL currency based on the candidate's location in the profile. Examples: India → "₹8L-12L" or "₹8-12 LPA", US → "$70K-90K", UK → "£50K-65K", Germany → "€55K-70K", Singapore → "S$60K-80K", UAE → "AED 15K-25K/mo", Australia → "A$80K-100K". If location is missing, default to USD.

SEARCH QUERIES:
- Based on the analysis, suggest 5-8 specific job search queries they should use
- These should be comma-separated role titles they'd actually search for
- E.g., for a 1 YOE Product Owner: ["Associate Product Manager", "APM", "Junior Product Manager", "Product Analyst", "Business Analyst", "Product Owner Startup"]

Profile data:
${profileData}

Return EXACTLY this JSON format (no markdown, no code blocks):
{
  "experienceBreakdown": {
    "fullTimeYears": 1.0,
    "internshipMonths": 18,
    "studentActivitiesMonths": 12,
    "effectiveYOE": 2.0,
    "level": "Junior",
    "levelRationale": "1 year full-time post-graduation + 18 months internships (9 months effective). Overlapping student activities during final year not double-counted."
  },
  "profileStrength": {
    "score": 65,
    "label": "Good",
    "missing": ["Professional certifications", "Open source contributions"]
  },
  "skillCategories": [
    {"name": "Product Management", "skills": ["PRDs", "Roadmapping", "User Research"], "strength": 75}
  ],
  "roleMatches": [
    {"title": "Associate Product Manager", "matchScore": 90, "reason": "Perfect fit for 1 YOE PM", "salaryRange": "$70K-90K", "levelAppropriate": true},
    {"title": "Product Owner (Startup)", "matchScore": 80, "reason": "Stretch role at smaller company", "salaryRange": "$65K-85K", "levelAppropriate": true},
    {"title": "Senior Product Manager", "matchScore": 30, "reason": "Needs 5+ YOE typically", "salaryRange": "$130K-170K", "levelAppropriate": false}
  ],
  "gapAnalysis": [
    {"skill": "SQL & Data Analysis", "importance": "critical", "forRoles": ["APM", "PM"], "learnTime": "1-2 months"}
  ],
  "careerTrajectory": {
    "current": "Entry-Level Product Owner",
    "sixMonths": "Product Owner / Associate PM",
    "oneYear": "Product Manager",
    "threeYears": "Senior Product Manager"
  },
  "industryFit": [
    {"industry": "SaaS Startups", "fitScore": 85, "reason": "Good fit for hands-on PM roles"}
  ],
  "actionItems": [
    {"priority": "high", "action": "Learn SQL and basic data analysis", "impact": "Required for 80% of PM roles"}
  ],
  "searchQueries": ["Associate Product Manager", "APM", "Junior PM", "Product Owner startup", "Business Analyst", "Product Analyst"],
  "headline": "Entry-level product professional with 1 year full-time experience, targeting APM and Junior PM roles"
}

Rules:
- THINK STEP BY STEP about experience classification before outputting
- Be BRUTALLY HONEST about their level - don't inflate
- Role matches MUST be appropriate for their effectiveYOE
- Include 8-10 role matches: mix of perfect fits, good fits, and stretch roles
- Mark stretch roles as levelAppropriate: false with honest reasons
- Salary ranges must match THEIR level, not senior-level ranges
- searchQueries should be practical job search terms they'd type
- Return 4-6 skill categories, 4-6 gap items, 3-5 industries, 5-7 actions`;

  const result = await askGemini(prompt);
  if (!result) return null;

  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(cleaned) as CareerAnalysis;

    // Email the user their results asynchronously
    if (session.user.email && session.user.name) {
      sendAnalysisEmail(session.user.email, session.user.name, analysis).catch(console.error);
    }

    await prisma.profile.update({
      where: { userId: session.user.id },
      data: { careerAnalysis: JSON.stringify(analysis) } as any
    });

    return analysis;
  } catch {
    console.error('Failed to parse career analysis:', result);
    return null;
  }
}
