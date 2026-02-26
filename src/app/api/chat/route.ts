import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createMistral } from '@ai-sdk/mistral';
import { createCohere } from '@ai-sdk/cohere';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const groq = createOpenAI({ baseURL: 'https://api.groq.com/openai/v1', apiKey: process.env.GROQ_API_KEY || '' });
const hf = createOpenAI({ baseURL: 'https://api-inference.huggingface.co/v1/', apiKey: process.env.HF_API_KEY || '' });
const mistral = createMistral({ apiKey: process.env.MISTRAL_API_KEY || '' });
const cohere = createCohere({ apiKey: process.env.COHERE_API_KEY || '' });

const MODEL_CASCADE = [
    // --- Tier 1: Premium models (best quality) ---
    { provider: google, modelName: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', supportsTools: true },
    { provider: google, modelName: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', supportsTools: true },
    { provider: groq, modelName: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Groq)', supportsTools: true },
    { provider: hf, modelName: 'Qwen/Qwen2.5-72B-Instruct', label: 'Qwen 2.5 72B (HF)', supportsTools: false },
    { provider: cohere, modelName: 'command-r-plus-08-2024', label: 'Command R+ (Cohere)', supportsTools: true },

    // --- Tier 2: Fast / Lite models (good quality, more quota headroom) ---
    { provider: google, modelName: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', supportsTools: true },
    { provider: hf, modelName: 'meta-llama/Llama-3.1-70B-Instruct', label: 'Llama 3.1 70B (HF)', supportsTools: false },
    { provider: mistral, modelName: 'mistral-small-latest', label: 'Mistral Small', supportsTools: true },
    { provider: groq, modelName: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (Groq)', supportsTools: true },
    { provider: cohere, modelName: 'command-r-08-2024', label: 'Command R (Cohere)', supportsTools: true },
    { provider: mistral, modelName: 'open-mistral-nemo', label: 'Mistral Nemo', supportsTools: true },
    { provider: groq, modelName: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Groq)', supportsTools: true },

    // --- Tier 3: Gemma open models (huge RPD quota ~14.4K, last resort) ---
    { provider: google, modelName: 'gemma-3-27b-it', label: 'Gemma 3 27B', supportsTools: false },
    { provider: google, modelName: 'gemma-3-12b-it', label: 'Gemma 3 12B', supportsTools: false },
    { provider: groq, modelName: 'gemma2-9b-it', label: 'Gemma 2 9B (Groq)', supportsTools: false },
    { provider: google, modelName: 'gemma-3-4b-it', label: 'Gemma 3 4B', supportsTools: false },
    { provider: cohere, modelName: 'command-light', label: 'Command Light (Cohere)', supportsTools: false }
];

async function cleanMessages(messages: any[], supportsTools: boolean) {
    try {
        return messages.map((m: any) => {
            let content = m.content || '';

            // Handle assistant messages with tool calls
            if (m.role === 'assistant' && m.toolInvocations && m.toolInvocations.length > 0) {
                if (!supportsTools) {
                    // Flatten tool calls into text
                    const toolsText = m.toolInvocations.map((ti: any) =>
                        `[AI Action: ${ti.toolName}]`
                    ).join('\n');
                    content = (content ? content + '\n' : '') + toolsText;
                    return { role: 'assistant', content };
                }
                // If it supports tools, we keep the toolInvocations (SDK handles them)
                return { role: 'assistant', content, toolInvocations: m.toolInvocations };
            }

            // Handle tool result messages
            if (m.role === 'tool' || (m.toolInvocations && m.toolInvocations.some((ti: any) => ti.result || ti.output))) {
                if (!supportsTools) {
                    // Flatten tool results into user-like text
                    const results = (m.toolInvocations || []).map((ti: any) =>
                        `[Tool Result: ${JSON.stringify(ti.result || ti.output || 'success')}]`
                    ).join('\n');
                    return { role: 'user', content: `AI Action results:\n${results}` };
                }
            }

            // Mistral/Groq occasionally fail if content is empty string
            if (typeof content === 'string' && content.trim() === '') {
                content = '...';
            }

            return { role: m.role, content };
        });
    } catch (e) {
        console.error('[Chat Streaming] Error in cleanMessages:', e);
        return messages; // Fallback to raw messages if cleaning fails
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const messages: any[] = body.messages || [];

    // Fetch user context to ground the AI
    const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
    if (!profile) {
        return new NextResponse('Profile not found', { status: 404 });
    }

    const currentAnalysis = (profile as any).careerAnalysis ? JSON.parse((profile as any).careerAnalysis) : null;

    const systemPrompt = `
You are "Doc", a highly insightful, slightly witty Career Coach AI for the CareerDoctor app.
You are talking to ${profile.fullName || 'a user'}.
Their current headline is: ${profile.title || 'Not specified'}.
Their skills are: ${profile.skills || 'None listed'}.
${currentAnalysis ? `Calculated Level: ${currentAnalysis.experienceBreakdown?.level} (${currentAnalysis.experienceBreakdown?.effectiveYOE} YOE)\nCurrent Trajectory: ${currentAnalysis.careerTrajectory?.current} -> ${currentAnalysis.careerTrajectory?.oneYear}` : ''}

Your goal is to be a supportive, conversational career coach. Chat with them normally first! Give specific, actionable advice based on their profile. Answer their questions naturally. Wait for them to ask for advice before giving it. Do not be generic.
IMPORTANT TOOL USAGE: You have a tool called 'proposeProfileUpdate'. When the user says they want to transition to a new role, gain new skills for a pivot, or update their profile target, you MUST call the proposeProfileUpdate tool immediately. Do NOT just say "I'll update your profile" in text — you must actually call the tool function. The tool will handle showing a confirmation UI to the user.
For example, if a user says "I want to become a Product Manager" or "Yes, update my profile", call proposeProfileUpdate right away with the target role and skills.
`;

    // Attempt a cascading fallback for streaming AI responses
    for (const entry of MODEL_CASCADE) {
        try {
            // FORCING CHAT API: In AI SDK v6+, the default openai provider might redirect to the new "Responses" API (/responses),
            // which most 3rd party providers (Groq, HF) do NOT support yet. 
            // We explicitly use .chat() to stick to the standard /chat/completions endpoint.
            const providerAny = entry.provider as any;
            const currentModel = providerAny.chat ? providerAny.chat(entry.modelName) : entry.provider(entry.modelName);

            const cleanedMessages = await cleanMessages(messages, entry.supportsTools);

            const result = streamText({
                model: currentModel as any,
                system: systemPrompt,
                messages: cleanedMessages,
                maxRetries: 0, // Fail fast so we can fallback to the next provider immediately
                toolChoice: entry.supportsTools ? 'auto' : undefined,
                tools: entry.supportsTools ? {
                    proposeProfileUpdate: {
                        description: 'Propose a major update to the users career trajectory, skills, or title based on their stated goals in the conversation. Call this tool when the user wants to pivot careers, change their target role, or add significant new skills to their profile.',
                        inputSchema: z.object({
                            targetRole: z.string().describe('The new role they are targeting (e.g., Product Manager)'),
                            reasoning: z.string().describe('Why this pivot makes sense for them'),
                            skillsToAdd: z.array(z.string()).describe('New skills they want to learn or add to their profile to achieve this')
                        }),
                        execute: async () => {
                            return { requiresConfirmation: true };
                        }
                    }
                } : undefined,
            });

            // PRE-FLIGHT CHECK: 
            // In App Router, result.toTextStreamResponse() returns 200 immediately. 
            // Errors (like 429) happen inside the stream. To CATCH them and fallback,
            // we must attempt to read the first meaningful chunk before returning the response.
            const [testStream, realStream] = result.fullStream.tee();
            const reader = testStream.getReader();

            try {
                // Read chunks until we find an error or meaningful content
                let attempts = 0;
                while (attempts < 5) { // Check first few chunks (metadata, usage, etc.)
                    const { value, done } = await Promise.race([
                        reader.read(),
                        new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Stream timeout')), 10000))
                    ]);

                    if (done) break;

                    // Debug: log all stream part types to understand what the model sends
                    console.log(`[Chat Streaming] Stream part for ${entry.label}: type=${value.type}`,
                        value.type === 'tool-call' ? `toolName=${(value as any).toolName}` : '');

                    if (value.type === 'error') {
                        console.warn(`[Chat Streaming] Late error part detected for ${entry.label}:`, value.error);
                        throw value.error;
                    }

                    if (value.type === 'text-delta' || value.type === 'tool-call' || value.type === 'tool-input-start') {
                        // Found content! The provider is definitely working.
                        break;
                    }

                    attempts++;
                }
                reader.releaseLock();
            } catch (streamError) {
                reader.releaseLock();
                throw streamError; // Rethrow so the outer catch block handles the fallback
            }

            console.log(`[Chat Streaming] ✓ Connection fully verified for: ${entry.label}`);

            // Use UIMessageStream (AI SDK v6 standard) which includes tool calls.
            // toTextStreamResponse() strips tool calls and only outputs text.
            return (result as any).toUIMessageStreamResponse();

        } catch (error: any) {
            console.warn(`[Chat Streaming] ✗ ${entry.label} failed: ${error?.message || 'Unknown error'}. Falling back...`);
            continue;
        }
    }

    return new NextResponse('All AI providers exhausted or failed.', { status: 503 });
}
