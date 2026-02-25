'use client';

import { useTheme } from '@/components/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const { isDark, toggle } = useTheme();

    return (
        <button
            onClick={toggle}
            className="relative w-14 h-7 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] flex items-center"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            type="button"
        >
            <span
                className={`absolute flex items-center justify-center w-5 h-5 rounded-full transition-all duration-200 shadow-sm
                    ${isDark
                        ? 'translate-x-[30px] bg-indigo-500'
                        : 'translate-x-[4px] bg-amber-400'
                    }`}
            >
                {isDark
                    ? <Moon className="h-3 w-3 text-white" />
                    : <Sun className="h-3 w-3 text-white" />
                }
            </span>
        </button>
    );
}
