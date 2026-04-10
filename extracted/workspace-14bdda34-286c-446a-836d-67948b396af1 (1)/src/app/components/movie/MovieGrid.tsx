'use client';

import MovieCard from './MovieCard';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSettingsStore } from '@/lib/store';

interface Movie {
  id: string;
  title: string;
  posterPath: string | null;
  year?: string;
  rating?: number;
  quality?: string;
  type?: 'movie' | 'series';
}

interface MovieGridProps {
  title?: string;
  movies: Movie[];
  showMore?: boolean;
  moreHref?: string;
  variant?: 'default' | 'compact'; // Compact for smaller cards
}

export default function MovieGrid({
  title,
  movies,
  showMore = false,
  moreHref,
  variant = 'compact',
}: MovieGridProps) {
  const { primaryColor } = useSettingsStore();

  return (
    <section className="mb-6">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between mb-3 px-4">
          <h2 className="text-lg font-bold">{title}</h2>
          {showMore && moreHref && (
            <Link
              href={moreHref}
              className="flex items-center gap-1 text-xs font-medium hover:underline"
              style={{ color: primaryColor }}
            >
              More <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}

      {/* Grid - 3 columns on mobile, more on larger screens */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 px-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            posterPath={movie.posterPath}
            year={movie.year}
            rating={movie.rating}
            quality={movie.quality}
            type={movie.type}
            compact={variant === 'compact'}
          />
        ))}
      </div>
    </section>
  );
}
