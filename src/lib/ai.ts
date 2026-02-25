import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

// Models ordered best → worst quality. Each has separate free-tier quotas.
const MODELS = [
    'gemini-2.5-pro',           // Best quality (pro)
    'gemini-2.5-flash',         // Best flash
    'gemini-2.0-flash',         // Reliable flash
    'gemini-2.0-flash-lite',    // Lightweight flash
    'gemini-3-flash-preview',   // Preview (newest)
    'gemini-3-pro-preview',     // Preview pro (newest)
];

function getClient() {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return null;
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
}

export async function askGemini(prompt: string): Promise<string | null> {
    const client = getClient();
    if (!client) return null;

    // Try each model — if one is rate-limited, fall back to the next
    for (const modelName of MODELS) {
        try {
            const model = client.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error: any) {
            const status = error?.status || error?.httpStatusCode;
            if (status === 429) {
                console.warn(`Rate limited on ${modelName}, trying next model...`);
                continue; // Try the next model
            }
            // Non-rate-limit error — don't retry
            console.error(`Gemini API error (${modelName}):`, error);
            return null;
        }
    }

    console.error('All Gemini models rate-limited');
    return null;
}

export async function getAIInsights(metricsJson: string): Promise<{
    headline: string;
    insight: string;
    tips: string[];
} | null> {
    const prompt = `You are an expert career coach. Given the following job application metrics JSON:

${metricsJson}

Provide a brief analysis in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):
{
  "headline": "One short sentence summarizing the overall strategy health",
  "insight": "2-3 sentences of personalized strategic advice based on the data",
  "tips": ["tip 1", "tip 2", "tip 3"]
}

Be specific, actionable, and reference the actual numbers. Keep it concise.`;

    const result = await askGemini(prompt);
    if (!result) return null;

    try {
        // Clean potential markdown wrapping
        const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
    } catch {
        console.error('Failed to parse AI response:', result);
        return null;
    }
}

export async function parseResumeWithAI(text: string): Promise<any | null> {
    if (!text || text.trim().length < 50) return null;

    const prompt = `Extract ALL structured data from this resume. Return EXACTLY this JSON format (no markdown, no code blocks). Extract as much as possible — projects, achievements, certifications, links, etc:
{
  "name": "Full name or null",
  "email": "Email or null",
  "phone": "Phone number or null",
  "title": "Current/most recent job title or null",
  "location": "City, State or null",
  "skills": ["skill1", "skill2"],
  "experience": [
    {"company": "Company", "title": "Job Title", "location": "City, State", "startDate": "Jan 2022", "endDate": "Present", "description": "Brief description"}
  ],
  "education": [
    {"institution": "University", "degree": "B.S.", "specialization": "Computer Science", "startYear": "2018", "endYear": "2022", "grade": "3.8/4.0"}
  ],
  "projects": [
    {"name": "Project Name", "description": "What it does", "techStack": "React, Node.js", "url": "https://...", "startDate": "Jan 2024", "endDate": "Present"}
  ],
  "achievements": [
    {"title": "Award or accomplishment", "description": "Details", "date": "2023"}
  ],
  "certifications": [
    {"name": "Certification Name", "issuer": "Issuing Organization", "date": "2023", "url": "https://..."}
  ],
  "links": [
    {"type": "linkedin", "url": "https://linkedin.com/in/..."},
    {"type": "github", "url": "https://github.com/..."}
  ],
  "summary": "2-3 sentence professional summary"
}

For links type use: linkedin, github, medium, portfolio, or other.
Extract ALL URLs found in the resume as links with appropriate types.
If no items found for a section, use empty array [].

Resume text:
${text.substring(0, 6000)}`;

    const result = await askGemini(prompt);
    if (!result) return null;

    try {
        const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
    } catch {
        console.error('Failed to parse resume AI response:', result);
        return null;
    }
}
