import { SkeletonCard, SkeletonLine, SkeletonCircle } from '@/components/LoadingSkeleton';

export default function Loading() {
    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            <div className="text-center mb-10">
                <div className="flex justify-center mb-4">
                    <SkeletonCircle size="w-12 h-12" />
                </div>
                <SkeletonLine width="w-64" height="h-8" className="mx-auto mb-3" />
                <SkeletonLine width="w-96" height="h-5" className="mx-auto" />
            </div>

            <SkeletonCard className="p-1 max-w-2xl mx-auto mb-10">
                <div className="p-4 bg-[var(--bg-primary)] rounded-lg">
                    <SkeletonLine width="w-full" height="h-24" />
                    <div className="flex justify-end mt-4">
                        <SkeletonLine width="w-40" height="h-10" />
                    </div>
                </div>
            </SkeletonCard>

            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <SkeletonCard key={i} className="p-6">
                        <div className="flex gap-4 mb-4">
                            <SkeletonLine width="w-20" height="h-6" className="!rounded-full" />
                            <SkeletonLine width="w-24" height="h-6" className="!rounded-full" />
                        </div>
                        <SkeletonLine width="w-full" height="h-20" />
                    </SkeletonCard>
                ))}
            </div>
        </main>
    );
}
