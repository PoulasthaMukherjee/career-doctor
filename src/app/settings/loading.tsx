import { SkeletonCard, SkeletonLine, SkeletonCircle } from '@/components/LoadingSkeleton';

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#fafafa] p-4 sm:p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-8">Account Settings</h1>

                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
                            <SkeletonCircle size="w-5 h-5 bg-slate-200" />
                            <SkeletonLine width="w-40" height="h-6 bg-slate-200" />
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <SkeletonLine width="w-24 bg-slate-200" height="h-4" className="mb-2" />
                                <SkeletonLine width="w-48 bg-slate-200" height="h-6" />
                            </div>
                            <div>
                                <SkeletonLine width="w-32 bg-slate-200" height="h-4" className="mb-2" />
                                <SkeletonLine width="w-64 bg-slate-200" height="h-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
