'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type ThemeContextType = {
    isDark: boolean;
    toggle: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggle: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('theme');
        const dark = stored === 'dark';
        setIsDark(dark);
        document.documentElement.classList.toggle('dark', dark);
        setMounted(true);
    }, []);

    const toggle = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        localStorage.setItem('theme', newDark ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', newDark);
    };

    if (!mounted) return <>{children}</>;

    return (
        <ThemeContext.Provider value={{ isDark, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}
