'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Target, Briefcase, Search, FileText, User, LogOut, Activity } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

type MobileNavProps = {
    userName?: string | null;
    isLoggedIn: boolean;
    signOutAction?: () => Promise<void>;
};

export default function MobileNav({ userName, isLoggedIn, signOutAction }: MobileNavProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // Close drawer on route change
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    const navLinks = [
        { href: '/', label: 'Overview', icon: Target },
        { href: '/applications', label: 'Applications', icon: Briefcase },
        { href: '/jobs', label: 'Find Jobs', icon: Search },
        { href: '/resumes', label: 'Resumes', icon: FileText },
        { href: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="md:hidden">
            {/* Hamburger button */}
            <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                aria-label="Toggle navigation menu"
            >
                {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                    style={{ top: '64px' }}
                />
            )}

            {/* Slide-out drawer */}
            <div
                className={`fixed top-16 right-0 bottom-0 z-50 w-72 bg-[var(--bg-secondary)] border-l border-[var(--border)] shadow-2xl transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* User greeting */}
                    {isLoggedIn && userName && (
                        <div className="px-5 py-4 border-b border-[var(--border)]">
                            <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Signed in as</p>
                            <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5 truncate">{userName}</p>
                        </div>
                    )}

                    {/* Nav links */}
                    {isLoggedIn && (
                        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-[var(--accent-light)] text-[var(--accent-text)]'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    )}

                    {/* Bottom actions */}
                    <div className="px-4 py-4 border-t border-[var(--border)] space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Theme</span>
                            <ThemeToggle />
                        </div>

                        {isLoggedIn && signOutAction && (
                            <form action={signOutAction}>
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--danger)] bg-[var(--danger-light)] rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </form>
                        )}

                        {!isLoggedIn && (
                            <Link
                                href="/login"
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
