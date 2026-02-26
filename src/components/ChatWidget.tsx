'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Sparkles, User, Briefcase, GraduationCap } from 'lucide-react';
import { updateProfileFromAI } from '@/lib/actions';

export function ChatWidget({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [messages, setMessages] = useState<any[]>([
        { id: '1', role: 'assistant', content: "Hi! I'm Doc, your personal AI career coach. Ready to plan your next move? You can ask me how to transition, what skills to learn, or to update your profile target." }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<HTMLDivElement>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { id: Date.now().toString(), role: 'user', content: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages })
            });

            if (!res.ok) throw new Error('Failed to fetch chat');

            // The Vercel AI SDK route stream actually returns highly specific multi-part chunk formatting
            // To properly render it without the hook, we need to carefully read its text response or JSON
            const reader = res.body?.getReader();
            if (!reader) throw new Error('No stream available');

            let assistantMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', toolInvocations: [] as any[] };
            setMessages(prev => [...prev, assistantMsg]);

            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });

                // Vercel AI SDK Data Stream Protocol parsing
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (!line) continue;

                    if (line.startsWith('0:')) {
                        // Text chunk (JSON wrapped)
                        try {
                            const textContent = JSON.parse(line.substring(2));
                            assistantMsg.content += textContent;
                        } catch (e) {
                            // Fallback for malformed JSON or raw text after prefix
                            assistantMsg.content += line.substring(2);
                        }
                    } else if (line.startsWith('9:')) {
                        // Tool call chunk
                        try {
                            const toolCall = JSON.parse(line.substring(2));
                            assistantMsg.toolInvocations.push({
                                toolCallId: toolCall.callId,
                                toolName: toolCall.toolName,
                                args: toolCall.args
                            });
                        } catch (e) { }
                    } else if (!/^[0-9a-z]:/.test(line)) {
                        // RAW TEXT FALLBACK: 
                        // If it doesn't match the "X:" pattern, it's likely raw text deltas
                        assistantMsg.content += line;
                    }

                    setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...assistantMsg } : m));
                }
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "I'm having a bit of trouble connecting to my brain right now (all AI providers are currently overwhelmed). Please try again in a few seconds!"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleConfirmUpdate = async (toolCallId: string, args: any) => {
        setIsUpdating(true);
        try {
            // We call a Server Action to formally update the database with this new target
            await updateProfileFromAI(args.targetRole, args.skillsToAdd);

            // Tell the chat the tool succeeded so the UI updates
            setMessages(prev => prev.map(m => {
                if (m.toolInvocations) {
                    return {
                        ...m,
                        toolInvocations: m.toolInvocations.map((t: any) =>
                            t.toolCallId === toolCallId ? { ...t, result: `Profile successfully updated to target: ${args.targetRole}. Career Analysis regenerated.` } : t
                        )
                    };
                }
                return m;
            }));

            // Dispatch a custom event to tell the page to refresh its data
            window.dispatchEvent(new Event('profile-updated'));

        } catch (error) {
            console.error(error);
            alert("Failed to update profile.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div
            ref={widgetRef}
            className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] flex flex-col z-50 overflow-hidden flex-shrink-0 animate-in slide-in-from-bottom-5
            bg-white/45 dark:bg-slate-900/45 backdrop-blur-xl
            rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]
            border border-slate-200/50 dark:border-slate-700/50">

            {/* Header - Premium Gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-600 dark:to-violet-700 text-white p-4 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <Bot size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm leading-tight tracking-tight">Doc</h3>
                        <p className="text-[10px] text-indigo-100/80 font-medium">AI Career Coach</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-95"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Chat Area - Translucent scroll with background micro-texture */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/20 scroll-smooth">
                {(messages || []).map((m: any) => (
                    <div key={m.id} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                        {/* Text Message */}
                        {m.content && (
                            <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${m.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-sm'
                                    : 'bg-[var(--bg-secondary)] dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-[var(--text-primary)] rounded-bl-sm'
                                    }`}>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                                </div>
                            </div>
                        )}

                        {/* Interactive Tool Call (Confirmation UI) - Premium Glass Card */}
                        {m.toolInvocations?.map((tool: any) => {
                            if (tool.toolName === 'proposeProfileUpdate') {
                                return (
                                    <div key={tool.toolCallId} className="my-4 bg-white/60 dark:bg-indigo-900/20 border border-indigo-200/50 dark:border-indigo-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-sm animate-in zoom-in-95 duration-500">
                                        <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                                            <Sparkles size={14} />
                                            Doc's Proposal
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 italic leading-relaxed">"{tool.args.reasoning}"</p>

                                        <div className="space-y-3 mb-5">
                                            <div className="flex items-center gap-3 text-sm bg-white/80 dark:bg-slate-800/80 p-3 border border-slate-100 dark:border-slate-700 rounded-xl shadow-inner-sm">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                    <Briefcase size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400">Target Role</span>
                                                    <span className="font-semibold text-slate-900 dark:text-white">{tool.args.targetRole}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 text-sm bg-white/80 dark:bg-slate-800/80 p-3 border border-slate-100 dark:border-slate-700 rounded-xl shadow-inner-sm">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                    <GraduationCap size={16} />
                                                </div>
                                                <div className="flex flex-col flex-1">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Skill Roadmap</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {tool.args.skillsToAdd.map((s: string) => (
                                                            <span key={s} className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full text-[10px] font-medium border border-slate-200/50 dark:border-slate-600/30">{s}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {!("result" in tool) ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleConfirmUpdate(tool.toolCallId, tool.args)}
                                                    disabled={isUpdating}
                                                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                                                >
                                                    {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <>Apply Strategy</>}
                                                </button>
                                                <button
                                                    disabled={isUpdating}
                                                    onClick={() => setMessages(prev => prev.map(m => {
                                                        if (m.toolInvocations) {
                                                            return {
                                                                ...m,
                                                                toolInvocations: m.toolInvocations.map((t: any) =>
                                                                    t.toolCallId === tool.toolCallId ? { ...t, result: 'User rejected the profile update.' } : t
                                                                )
                                                            };
                                                        }
                                                        return m;
                                                    }))}
                                                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold py-3 rounded-xl transition-all active:scale-95"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 py-3 rounded-xl border border-emerald-200 dark:border-emerald-500/30 shadow-inner flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
                                                <Sparkles size={14} />
                                                Strategic Update Applied
                                            </div>
                                        )}
                                    </div>
                                )
                            }
                        })}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-slate-400 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Glass Input */}
            <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                <form onSubmit={handleFormSubmit} className="relative flex items-center">
                    <input
                        className="w-full bg-slate-100 dark:bg-slate-800/80 border-none rounded-2xl pl-4 pr-12 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Discuss your next career move..."
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-indigo-500/40 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all active:scale-90"
                    >
                        <Send size={18} className="ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
