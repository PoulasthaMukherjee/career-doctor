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
const hf = createOpenAI({ baseURL: 'https://router.huggingface.co/openai/v1', apiKey: process.env.HF_API_KEY || '' });
const mistral = createMistral({ apiKey: process.env.MISTRAL_API_KEY || '' });
const cohere = createCohere({ apiKey: process.env.COHERE_API_KEY || '' });

const MODEL_CASCADE = [
    { provider: google, modelName: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', supportsTools: true },
    { provider: groq, modelName: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Groq)', supportsTools: true },
    { provider: hf, modelName: 'Qwen/Qwen2.5-72B-Instruct', label: 'Qwen 2.5 72B (HF)', supportsTools: false },
    { provider: cohere, modelName: 'command-r-plus-08-2024', label: 'Command R+ (Cohere)', supportsTools: true },
    { provider: hf, modelName: 'meta-llama/Llama-3.1-70B-Instruct', label: 'Llama 3.1 70B (HF)', supportsTools: false },
    { provider: mistral, modelName: 'mistral-small-latest', label: 'Mistral Small', supportsTools: true },
    { provider: groq, modelName: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (Groq)', supportsTools: true },
    { provider: google, modelName: 'gemma-3-27b-it', label: 'Gemma 3 27B', supportsTools: false },
    { provider: cohere, modelName: 'command-r-08-2024', label: 'Command R (Cohere)', supportsTools: true },
    { provider: mistral, modelName: 'open-mistral-nemo', label: 'Mistral Nemo', supportsTools: true },
    { provider: google, modelName: 'gemma-3-12b-it', label: 'Gemma 3 12B', supportsTools: false },
    { provider: groq, modelName: 'gemma2-9b-it', label: 'Gemma 2 9B (Groq)', supportsTools: false },
    { provider: google, modelName: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash', supportsTools: true },
    { provider: groq, modelName: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Groq)', supportsTools: true },
    { provider: google, modelName: 'gemma-3-4b-it', label: 'Gemma 3 4B', supportsTools: false },
    { provider: cohere, modelName: 'command-light', label: 'Command Light (Cohere)', supportsTools: false }
];

function cleanMessages(messages: any[]) {
    return messages.filter(m => {
        if (!m.content || (typeof m.content === 'string' && m.content.trim() === '')) {
            // Mistral/Groq fail on empty assistant/user messages
            return false;
        }
        return true;
    }).map(m => {
        // Ensure content is a string if it's not complex
        if (typeof m.content === 'object' && Array.isArray(m.content) && m.content.length === 0) {
            return { ...m, content: '...' };
        }
        return m;
    });
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const messages: any[] = body.messages;

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
IMPORTANT: You have a tool called 'proposeProfileUpdate'. ONLY use this tool if the user EXPLICITLY says they want to transition to a new role, gain new skills for a pivot, or officially update their profile target. Do not use this tool for general conversation or casual skill mentions. When in doubt, just talk to them.
If you do decide a major pivot is happening, ask them: "Would you like me to update your career profile to reflect this new goal?" If they say yes, then run the tool.
`;

    // Attempt a cascading fallback for streaming AI responses
    for (const entry of MODEL_CASCADE) {
        try {
            // @ts-ignore - Some models might throw typing errors based on string literal mismatches, but the SDK handles them
            const currentModel = entry.provider(entry.modelName);

            const cleanedMessages = cleanMessages(messages);

            const result = streamText({
                model: currentModel as any,
                system: systemPrompt,
                messages: cleanedMessages,
                maxRetries: 0, // Fail fast so we can fallback to the next provider immediately
                tools: entry.supportsTools ? {
                    proposeProfileUpdate: {
                        description: 'Propose a major update to the users career trajectory, skills, or title based on their stated goals in the conversation. Use this when they want to pivot careers or add significant new context to their profile.',
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
                        new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Stream timeout')), 5000))
                    ]);

                    if (done) break;

                    if (value.type === 'error') {
                        console.warn(`[Chat Streaming] Late error part detected for ${entry.label}:`, value.error);
                        throw value.error;
                    }

                    if (value.type === 'text-delta' || value.type === 'tool-call') {
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

            // Note: result.toTextStreamResponse() internally uses the stream. 
            // Since we've confirmed the connection via tee(), we return the response.
            // We TRY to use toDataStreamResponse (which includes tools) if available, 
            // otherwise fallback to text.
            const resultAny = result as any;
            if (resultAny.toDataStreamResponse) {
                return resultAny.toDataStreamResponse();
            }
            return result.toTextStreamResponse();

        } catch (error: any) {
            console.warn(`[Chat Streaming] ✗ ${entry.label} failed: ${error?.message || 'Unknown error'}. Falling back...`);
            continue;
        }
    }

    return new NextResponse('All AI providers exhausted or failed.', { status: 503 });
}
