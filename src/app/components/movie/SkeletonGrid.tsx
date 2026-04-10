'use client';

interface SkeletonGridProps {
  count?: number;
  compact?: boolean;
}

function SkeletonCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-md overflow-hidden bg-[#1a1a1a]">
      {/* Poster skeleton */}
      <div className="aspect-[2/3] shimmer" />
      {/* Title skeleton */}
      <div className={compact ? 'p-1.5 space-y-1' : 'p-2 space-y-1.5'}>
        <div className={`shimmer rounded ${compact ? 'h-2.5 w-4/5' : 'h-3 w-4/5'}`} />
        <div className={`shimmer rounded ${compact ? 'h-2 w-1/2' : 'h-2 w-1/2'}`} />
      </div>
    </div>
  );
}

export default function SkeletonGrid({ count = 12, compact = true }: SkeletonGridProps) {
  return (
    <section className="mb-6">
      {/* Title skeleton */}
      <div className="flex items-center justify-between mb-3 px-4">
        <div className="shimmer rounded h-5 w-20" />
      </div>
      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 px-4">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} compact={compact} />
        ))}
      </div>
    </section>
  );
}
