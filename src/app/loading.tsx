import { SkeletonBox, SkeletonCard, SkeletonLine, SkeletonCircle } from '@/components/LoadingSkeleton';

export default function Loading() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">Overview</h1>
                    <SkeletonLine width="w-48" className="mt-2" />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map(i => (
                    <SkeletonCard key={i} className="flex flex-col">
                        <div className="flex items-center gap-3 mb-2">
                            <SkeletonCircle size="w-8 h-8" />
                            <SkeletonLine width="w-24" />
                        </div>
                        <SkeletonLine width="w-16" height="h-8" className="mt-2" />
                    </SkeletonCard>
                ))}
            </div>

            {/* Funnel & Strategy */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <SkeletonCard className="h-80" />
                <SkeletonCard className="h-80" />
            </div>

            {/* Career Intelligence Placeholder */}
            <SkeletonCard className="h-64" />
        </div>
    );
}
