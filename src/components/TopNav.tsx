import { Activity, Target, Briefcase, FileText, LogOut, Search, User, Mic, Zap } from 'lucide-react';
import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
import ThemeToggle from './ThemeToggle';
import MobileNav from './MobileNav';
import AccountMenu from './AccountMenu';

export default async function TopNav() {
    const session = await auth();

    const signOutAction = session?.user ? async () => {
        'use server';
        await signOut({ redirectTo: '/login' });
    } : undefined;

    return (
        <nav className="border-b border-[var(--border)] bg-[var(--bg-secondary)] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    <Link href="/" className="flex items-center space-x-2">
                        <Activity className="h-6 w-6 text-[var(--accent)]" />
                        <span className="font-semibold text-lg tracking-tight text-[var(--text-primary)]">CareerDoctor</span>
                    </Link>

                    {/* Desktop nav links - hidden on mobile */}
                    {session?.user && (
                        <div className="hidden md:flex space-x-1 sm:space-x-2 items-center">
                            <Link href="/" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 rounded-md hover:bg-[var(--bg-tertiary)]">
                                <Target className="h-4 w-4" /> <span>Overview</span>
                            </Link>
                            <Link href="/applications" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 rounded-md hover:bg-[var(--bg-tertiary)]">
                                <Briefcase className="h-4 w-4" /> <span>Applications</span>
                            </Link>
                            <Link href="/jobs" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 rounded-md hover:bg-[var(--bg-tertiary)]">
                                <Search className="h-4 w-4" /> <span>Jobs</span>
                            </Link>
                            <Link href="/resumes" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 rounded-md hover:bg-[var(--bg-tertiary)]">
                                <FileText className="h-4 w-4" /> <span>Resumes</span>
                            </Link>
                            <Link href="/interview-prep" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 rounded-md hover:bg-[var(--bg-tertiary)]">
                                <Mic className="h-4 w-4" /> <span>Prep</span>
                            </Link>
                            <Link href="/digest" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 rounded-md hover:bg-[var(--bg-tertiary)]">
                                <Zap className="h-4 w-4" /> <span>Digest</span>
                            </Link>

                            <ThemeToggle />

                            <AccountMenu
                                userName={session.user.name || session.user.email}
                                signOutAction={signOutAction!}
                            />
                        </div>
                    )}

                    {/* Not logged in - desktop */}
                    {!session && (
                        <div className="hidden md:flex items-center space-x-3">
                            <ThemeToggle />
                            <Link href="/login" className="text-sm font-medium text-[var(--accent-text)] hover:opacity-80">Sign in</Link>
                        </div>
                    )}

                    {/* Mobile hamburger nav */}
                    <MobileNav
                        isLoggedIn={!!session?.user}
                        userName={session?.user?.name || session?.user?.email}
                        signOutAction={signOutAction}
                    />

                </div>
            </div>
        </nav>
    );
}
