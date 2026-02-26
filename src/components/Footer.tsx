import { Activity } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Brand */}
                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-[var(--accent)]" />
                        <span className="text-sm font-medium text-[var(--text-secondary)]">CareerDoctor</span>
                    </div>

                    {/* Copyright */}
                    <p className="text-xs text-[var(--text-tertiary)] text-center sm:text-right">
                        &copy; {currentYear} Poulastha Mukherjee. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
