import LoginForm from '@/components/LoginForm';
import { Activity } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-[var(--accent)]">
                    <Activity className="h-12 w-12" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--text-primary)]">Sign in to your account</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[var(--bg-secondary)] py-8 px-4 shadow-[var(--card-shadow)] border border-[var(--border)] sm:rounded-xl sm:px-10">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}
