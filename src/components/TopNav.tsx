import { Activity, Target, Briefcase, FileText, LogOut, Search, User } from 'lucide-react';
import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
import ThemeToggle from './ThemeToggle';

export default async function TopNav() {
    const session = await auth();

    return (
        <nav className="border-b border-[var(--border)] bg-[var(--bg-secondary)] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    <Link href="/" className="flex items-center space-x-2">
                        <Activity className="h-6 w-6 text-[var(--accent)]" />
                        <span className="font-semibold text-lg tracking-tight text-[var(--text-primary)] hidden sm:block">CareerDoctor</span>
                    </Link>

                    {session?.user && (
                        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar items-center">
                            <Link href="/" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 rounded-md hover:bg-[var(--bg-tertiary)]">
                                <Target className="h-4 w-4" /> <span className="hidden sm:inline">Overview</span>
                            </Link>
                            <Link href="/applications" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 rounded-md hover:bg-[var(--bg-tertiary)]">
                                <Briefcase className="h-4 w-4" /> <span className="hidden sm:inline">Applications</span>
                            </Link>
                            <Link href="/jobs" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 rounded-md hover:bg-[var(--bg-tertiary)]">
                                <Search className="h-4 w-4" /> <span className="hidden sm:inline">Jobs</span>
                            </Link>
                            <Link href="/resumes" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 rounded-md hover:bg-[var(--bg-tertiary)]">
                                <FileText className="h-4 w-4" /> <span className="hidden sm:inline">Resumes</span>
                            </Link>
                            <Link href="/profile" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 rounded-md hover:bg-[var(--bg-tertiary)]">
                                <User className="h-4 w-4" /> <span className="hidden md:inline">Profile</span>
                            </Link>

                            <ThemeToggle />

                            <form action={async () => {
                                'use server';
                                await signOut({ redirectTo: '/login' });
                            }}>
                                <button type="submit" className="ml-1 p-2 text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors rounded-full hover:bg-[var(--danger-light)]">
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    )}

                    {!session && (
                        <div className="flex items-center space-x-3">
                            <ThemeToggle />
                            <Link href="/login" className="text-sm font-medium text-[var(--accent-text)] hover:opacity-80">Sign in</Link>
                        </div>
                    )}

                </div>
            </div>
        </nav>
    );
}
