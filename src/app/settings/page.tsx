import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User, Mail, Shield, LogOut } from "lucide-react";

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    return (
        <div className="min-h-screen bg-[#fafafa] p-4 sm:p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-8">Account Settings</h1>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
                        <User className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-lg font-medium text-slate-900">Profile Information</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Name</label>
                            <p className="text-slate-900 font-medium">{session.user.name || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                                <Mail className="h-4 w-4" /> Email Address
                            </label>
                            <p className="text-slate-900 font-medium">{session.user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-lg font-medium text-slate-900">Security</h2>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-slate-600 mb-4">You are signed in with Email & Password credentials.</p>
                        <button disabled className="bg-slate-100 text-slate-400 px-4 py-2 rounded-lg font-medium cursor-not-allowed">
                            Change Password
                        </button>
                        <p className="text-xs text-slate-400 mt-2">To reset your password, contact support.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-red-50 bg-red-50/50 flex items-center gap-2">
                        <LogOut className="h-5 w-5 text-red-600" />
                        <h2 className="text-lg font-medium text-red-900">Danger Zone</h2>
                    </div>
                    <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-sm font-medium text-slate-900">Sign Out</h3>
                            <p className="text-sm text-slate-500">Log out of your account on this device.</p>
                        </div>
                        <form action={async () => {
                            'use server';
                            await signOut({ redirectTo: '/login' });
                        }}>
                            <button type="submit" className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors border border-red-200">
                                Sign out
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}
