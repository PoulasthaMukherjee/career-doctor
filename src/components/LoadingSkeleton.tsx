export function SkeletonBox({ className = '' }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-[var(--bg-tertiary)] rounded-lg ${className}`} />
    );
}

export function SkeletonLine({ width = 'w-full', height = 'h-4', className = '' }: { width?: string; height?: string; className?: string }) {
    return (
        <div className={`animate-pulse bg-[var(--bg-tertiary)] rounded ${width} ${height} ${className}`} />
    );
}

export function SkeletonCard({ className = '', children }: { className?: string; children?: React.ReactNode }) {
    return (
        <div className={`bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6 ${className}`}>
            {children || (
                <div className="space-y-3">
                    <SkeletonLine width="w-1/3" height="h-5" />
                    <SkeletonLine width="w-full" />
                    <SkeletonLine width="w-2/3" />
                </div>
            )}
        </div>
    );
}

export function SkeletonCircle({ size = 'w-10 h-10', className = '' }: { size?: string; className?: string }) {
    return (
        <div className={`animate-pulse bg-[var(--bg-tertiary)] rounded-full ${size} ${className}`} />
    );
}
