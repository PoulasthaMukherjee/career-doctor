'use client';

import { signIn } from "@/lib/actions";
import Link from 'next/link';
import { useState } from "react";
import { useRouter } from "next/navigation";
import OAuthButtons from "./OAuthButtons";

export default function LoginForm() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await signIn(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push('/');
        }
    }

    return (
        <div className="space-y-6">
            <OAuthButtons />

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border)]" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[var(--bg-secondary)] text-[var(--text-tertiary)]">Or continue with email</span>
                </div>
            </div>

            <form className="space-y-5" action={handleSubmit}>
                {error && (
                    <div className="p-3 bg-[var(--danger-light)] text-[var(--danger)] border border-[var(--border)] rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)]">Email address</label>
                    <div className="mt-1">
                        <input id="email" name="email" type="email" autoComplete="email" required
                            className="appearance-none block w-full px-3 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)]">Password</label>
                    <div className="mt-1">
                        <input id="password" name="password" type="password" autoComplete="current-password" required
                            className="appearance-none block w-full px-3 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <button type="submit" disabled={loading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </div>

                <div className="text-sm text-center">
                    <span className="text-[var(--text-tertiary)]">Don't have an account? </span>
                    <Link href="/register" className="font-medium text-[var(--accent-text)] hover:opacity-80">
                        Sign up
                    </Link>
                </div>
            </form>
        </div>
    );
}
