'use client';

interface SkeletonGridProps {
  count?: number;
  title?: string;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5">
      {/* Poster skeleton */}
      <div className="aspect-[2/3] shimmer" />
      {/* Title skeleton only */}
      <div className="p-2.5">
        <div className="shimmer rounded h-2.5 w-4/5" />
      </div>
    </div>
  );
}

export default function SkeletonGrid({ count = 10, title }: SkeletonGridProps) {
  return (
    <section className="mb-8">
      {title && (
        <div className="mb-4 px-4">
          <div className="shimmer rounded h-5 w-24" />
        </div>
      )}
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 px-4">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </section>
  );
}
