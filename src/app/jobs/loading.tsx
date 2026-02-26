import { SkeletonCard, SkeletonLine, SkeletonCircle } from '@/components/LoadingSkeleton';

export default function Loading() {
    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
            <div className="text-center max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <SkeletonCircle size="w-6 h-6" />
                    <SkeletonLine width="w-32" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] mb-4">Live Job Leads</h1>
                <SkeletonLine width="w-2/3" className="mx-auto" />
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
                <div className="flex gap-2">
                    <SkeletonLine width="w-full" height="h-14" />
                    <SkeletonLine width="w-32" height="h-14" />
                </div>
                <div className="flex gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <SkeletonLine key={i} width="w-24" height="h-8" className="!rounded-md" />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <SkeletonCard key={i} className="flex flex-col h-64" />
                ))}
            </div>
        </main>
    );
}
