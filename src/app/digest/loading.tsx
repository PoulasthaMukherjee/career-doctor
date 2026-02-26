import { SkeletonCard, SkeletonLine, SkeletonCircle } from '@/components/LoadingSkeleton';

export default function Loading() {
    return (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                    <div className="flex items-center gap-3">
                        <SkeletonCircle size="w-8 h-8" />
                        <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Daily Digest</h1>
                    </div>
                    <SkeletonLine width="w-64" height="h-5" className="mt-2" />
                </div>
                <SkeletonLine width="w-32" height="h-8" className="!rounded-full" />
            </div>

            <div className="mb-10">
                <SkeletonCard className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-4">
                        <SkeletonCircle size="w-5 h-5" />
                        <SkeletonLine width="w-32" height="h-6" />
                    </div>
                    <SkeletonLine width="w-3/4" height="h-8" className="mb-4" />
                    <SkeletonLine width="w-full" height="h-16" />
                </SkeletonCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkeletonCard className="h-64" />
                <SkeletonCard className="h-64" />
            </div>
        </main>
    );
}
