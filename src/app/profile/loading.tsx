import { SkeletonCard, SkeletonLine, SkeletonCircle } from '@/components/LoadingSkeleton';

export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">Your Career Profile</h1>
                    <SkeletonLine width="w-64" className="mt-2" />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <SkeletonLine width="w-24" height="h-10" />
                    <SkeletonLine width="w-24" height="h-10" />
                </div>
            </div>

            {/* Profile Header Card */}
            <SkeletonCard className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[var(--bg-tertiary)] flex-shrink-0 animate-pulse" />
                <div className="flex-1 space-y-3 pb-4">
                    <SkeletonLine width="w-1/2" height="h-8" />
                    <SkeletonLine width="w-3/4" height="h-5" />
                    <div className="flex flex-wrap gap-4 mt-2">
                        <SkeletonLine width="w-32" />
                        <SkeletonLine width="w-32" />
                        <SkeletonLine width="w-32" />
                    </div>
                </div>
            </SkeletonCard>

            {/* Other Sections */}
            {[1, 2, 3].map(i => (
                <SkeletonCard key={i} className="p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-[var(--border)] pb-4">
                        <SkeletonCircle size="w-5 h-5" />
                        <SkeletonLine width="w-32" height="h-6" />
                    </div>
                    <div className="space-y-4">
                        <SkeletonLine width="w-full" height="h-20" />
                    </div>
                </SkeletonCard>
            ))}
        </div>
    );
}
