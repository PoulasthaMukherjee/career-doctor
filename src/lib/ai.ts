import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

// ─── QUALITY-RANKED MODEL CASCADE ───
// All 20 models across 6 providers, ordered globally by quality (best → worst).
// On rate-limit (429) or error, it tries the NEXT BEST model regardless of provider.

type ModelEntry = {
    provider: 'gemini' | 'groq' | 'mistral' | 'cohere' | 'hf';
    model: string;
    label: string;
};

const MODEL_CASCADE: ModelEntry[] = [
    // ── Tier 1: Best available Gemini ──
    { provider: 'gemini', model: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },

    // ── Tier 2: Large open models (70B+) ──
    { provider: 'groq', model: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Groq)' },
    { provider: 'hf', model: 'Qwen/Qwen2.5-72B-Instruct', label: 'Qwen 2.5 72B (HF)' },
    { provider: 'cohere', model: 'command-r-plus', label: 'Command R+ (Cohere)' },
    { provider: 'hf', model: 'meta-llama/Llama-3.1-70B-Instruct', label: 'Llama 3.1 70B (HF)' },

    // ── Tier 3: Strong medium models ──
    { provider: 'mistral', model: 'mistral-small-latest', label: 'Mistral Small' },
    { provider: 'groq', model: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (Groq)' },
    { provider: 'gemini', model: 'gemma-3-27b-it', label: 'Gemma 3 27B' },
    { provider: 'cohere', model: 'command-r', label: 'Command R (Cohere)' },
    { provider: 'mistral', model: 'open-mistral-nemo', label: 'Mistral Nemo' },
    { provider: 'hf', model: 'mistralai/Mistral-Nemo-Instruct-2407', label: 'Mistral Nemo (HF)' },

    // ── Tier 4: Smaller / lightweight models ──
    { provider: 'gemini', model: 'gemma-3-12b-it', label: 'Gemma 3 12B' },
    { provider: 'groq', model: 'gemma2-9b-it', label: 'Gemma 2 9B (Groq)' },
    { provider: 'gemini', model: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
    { provider: 'groq', model: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Groq)' },
    { provider: 'gemini', model: 'gemma-3-4b-it', label: 'Gemma 3 4B' },
    { provider: 'cohere', model: 'command-light', label: 'Command Light (Cohere)' },
];

// ─── Clients ───

function getGeminiClient() {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return null;
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
}

// ─── Provider Call Functions ───

async function callGemini(prompt: string, model: string): Promise<string> {
    const client = getGeminiClient();
    if (!client) throw new Error('No GEMINI_API_KEY');
    const m = client.getGenerativeModel({ model });
    const result = await m.generateContent(prompt);
    return result.response.text();
}

async function callOpenAICompat(
    url: string, apiKey: string, model: string, prompt: string, name: string
): Promise<string> {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 4096,
        }),
    });
    if (!res.ok) {
        const err: any = new Error(`${name} API error: ${res.status}`);
        err.status = res.status;
        throw err;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
}

async function callGroq(prompt: string, model: string): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('No GROQ_API_KEY');
    return callOpenAICompat('https://api.groq.com/openai/v1/chat/completions', apiKey, model, prompt, 'Groq');
}

async function callMistral(prompt: string, model: string): Promise<string> {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) throw new Error('No MISTRAL_API_KEY');
    return callOpenAICompat('https://api.mistral.ai/v1/chat/completions', apiKey, model, prompt, 'Mistral');
}

async function callCohere(prompt: string, model: string): Promise<string> {
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) throw new Error('No COHERE_API_KEY');
    const res = await fetch('https://api.cohere.ai/v2/chat', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 4096,
        }),
    });
    if (!res.ok) {
        const err: any = new Error(`Cohere API error: ${res.status}`);
        err.status = res.status;
        throw err;
    }
    const data = await res.json();
    return data.message?.content?.[0]?.text || '';
}

async function callHuggingFace(prompt: string, model: string): Promise<string> {
    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) throw new Error('No HF_API_KEY');
    const res = await fetch(`https://api-inference.huggingface.co/models/${model}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 4096,
        }),
    });
    if (!res.ok) {
        const err: any = new Error(`HuggingFace API error: ${res.status}`);
        err.status = res.status;
        throw err;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
}

// ─── Provider dispatcher ───

const PROVIDER_FN: Record<ModelEntry['provider'], (prompt: string, model: string) => Promise<string>> = {
    gemini: callGemini,
    groq: callGroq,
    mistral: callMistral,
    cohere: callCohere,
    hf: callHuggingFace,
};

// Track providers with no API key - skip them after the first miss
const skippedProviders = new Set<string>();

// ─── Unified Quality-Ordered AI Call ───

export async function askAI(prompt: string): Promise<string | null> {
    for (const entry of MODEL_CASCADE) {
        if (skippedProviders.has(entry.provider)) continue;

        try {
            const result = await PROVIDER_FN[entry.provider](prompt, entry.model);
            if (result) {
                console.log(`[AI] ✓ ${entry.label}`);
                return result;
            }
        } catch (error: any) {
            const status = error?.status || error?.httpStatusCode;
            if (status === 429 || status === 503) {
                console.warn(`[AI] ✗ ${entry.label} - rate limited, next...`);
                continue;
            }
            if (error?.message?.startsWith('No ')) {
                console.warn(`[AI] ✗ ${entry.provider} - no API key, skipping provider`);
                skippedProviders.add(entry.provider);
                continue;
            }
            console.error(`[AI] ✗ ${entry.label}:`, error?.message || error);
            continue;
        }
    }

    console.error('[AI] All 20 models exhausted');
    return null;
}

// Backward compatibility
export const askGemini = askAI;

// ─── Structured AI Functions ───

function cleanJsonResponse(text: string): string {
    return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
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

    const result = await askAI(prompt);
    if (!result) return null;

    try {
        return JSON.parse(cleanJsonResponse(result));
    } catch {
        console.error('Failed to parse AI response:', result);
        return null;
    }
}

export async function parseResumeWithAI(text: string): Promise<any | null> {
    if (!text || text.trim().length < 50) return null;

    const prompt = `Extract ALL structured data from this resume. Return EXACTLY this JSON format (no markdown, no code blocks). Extract as much as possible - projects, achievements, certifications, links, etc:
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

    const result = await askAI(prompt);
    if (!result) return null;

    try {
        return JSON.parse(cleanJsonResponse(result));
    } catch {
        console.error('Failed to parse resume AI response:', result);
        return null;
    }
}
