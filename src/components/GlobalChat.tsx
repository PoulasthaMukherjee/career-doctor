'use client';

import { useState } from 'react';
import { Bot, MessageSquareText } from 'lucide-react';
import { ChatWidget } from './ChatWidget';

export default function GlobalChat() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* The Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 h-14 w-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-indigo-500/25 hover:scale-105 hover:-translate-y-1 transition-all z-40"
                    aria-label="Open AI Career Coach"
                >
                    <MessageSquareText size={28} className="drop-shadow-sm" />
                </button>
            )}

            {/* The Chat Widget */}
            <ChatWidget isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
