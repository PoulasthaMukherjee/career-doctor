'use client';

import { registerUser } from "@/lib/actions";
import Link from 'next/link';
import { Activity } from 'lucide-react';
import { useState } from "react";
import { useRouter } from "next/navigation";
import OAuthButtons from "@/components/OAuthButtons";

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await registerUser(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else if (result?.success) {
            router.push('/login?registered=true');
        }
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-[var(--accent)]">
                    <Activity className="h-12 w-12 text-[var(--accent)]" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--text-primary)]">Create your account</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[var(--bg-secondary)] py-8 px-4 shadow-[var(--card-shadow)] border border-[var(--border)] sm:rounded-xl sm:px-10">

                    <OAuthButtons />

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--border)]" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[var(--bg-secondary)] text-[var(--text-tertiary)]">Or sign up with email</span>
                        </div>
                    </div>

                    <form className="space-y-5" action={handleSubmit}>
                        {error && (
                            <div className="p-3 bg-[var(--danger-light)] text-[var(--danger)] border border-[var(--border)] rounded-lg text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)]">Full Name</label>
                            <div className="mt-1">
                                <input id="name" name="name" type="text" required
                                    className="appearance-none block w-full px-3 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent sm:text-sm"
                                />
                            </div>
                        </div>

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
                                <input id="password" name="password" type="password" required
                                    className="appearance-none block w-full px-3 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button type="submit" disabled={loading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] disabled:opacity-50 transition-colors"
                            >
                                {loading ? "Creating account..." : "Sign up"}
                            </button>
                        </div>

                        <div className="text-sm text-center">
                            <span className="text-[var(--text-tertiary)]">Already have an account? </span>
                            <Link href="/login" className="font-medium text-[var(--accent-text)] hover:opacity-80">
                                Log in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
