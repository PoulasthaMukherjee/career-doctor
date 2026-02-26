import { SkeletonCard, SkeletonLine, SkeletonCircle } from '@/components/LoadingSkeleton';

export default function Loading() {
    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-3 text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
                    <SkeletonCircle size="w-8 h-8" />
                    <h1>Applications</h1>
                </div>
                <SkeletonLine width="w-32" height="h-10" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
                {[1, 2, 3, 4, 5].map(i => (
                    <SkeletonLine key={i} width="w-24" height="h-10" className="flex-shrink-0 !rounded-lg" />
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <SkeletonCard key={i} className="relative overflow-hidden h-40" />
                ))}
            </div>
        </main>
    );
}
