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
  quality?: string | null;
  type?: 'movie' | 'series';
}

interface MovieGridProps {
  title?: string;
  movies: Movie[];
  showMore?: boolean;
  moreHref?: string;
  variant?: 'default' | 'compact';
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
    <section className="mb-8">
      {title && (
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>
          {showMore && moreHref && (
            <Link
              href={moreHref}
              className="flex items-center gap-0.5 text-xs font-medium text-white/40 hover:text-white"
            >
              <span>More</span>
              <ChevronRight className="w-3.5 h-3.5" style={{ color: primaryColor }} />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 px-4">
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
