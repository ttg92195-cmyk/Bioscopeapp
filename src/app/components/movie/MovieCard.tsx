'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Bookmark, BookmarkCheck } from 'lucide-react';
import { useUserStore, StoredMovie } from '@/lib/store';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  id: string;
  title: string;
  posterPath: string | null;
  year?: string;
  rating?: number;
  quality?: string | null;
  type?: 'movie' | 'series';
  showBookmark?: boolean;
  compact?: boolean;
}

export default function MovieCard({
  id,
  title,
  posterPath,
  year,
  rating,
  quality,
  type = 'movie',
  showBookmark = true,
  compact = false,
}: MovieCardProps) {
  const { isBookmarked, addBookmark, removeBookmark } = useUserStore();
    const bookmarked = isBookmarked(id);

  const displayTitle = title || 'Movie';
  const posterUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : '/placeholder-poster.png';

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarked) {
      removeBookmark(id);
    } else {
      const storedMovie: StoredMovie = {
        id,
        title: displayTitle,
        posterPath,
        releaseDate: year ? `${year}-01-01` : null,
        rating: rating ?? 0,
        type,
        quality: quality ?? null,
      };
      addBookmark(storedMovie);
    }
  };

  return (
    <Link
      href={type === 'series' ? `/series/${id}` : `/movie/${id}`}
      className="movie-card group relative block rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5"
    >
      {/* Poster */}
      <div className="aspect-[2/3] relative">
        <Image
          src={posterUrl}
          alt={displayTitle}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 15vw"
          unoptimized
        />

        {/* Quality Badge */}
        {quality && (
          <span
            className={cn(
              "absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full shadow-lg shadow-black/30 text-white",
              quality === '4K' ? "badge-4k" : "badge-exclusive"
            )}
          >
            {quality}
          </span>
        )}

        {/* Rating */}
        {rating !== undefined && rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-full text-[10px] font-medium border border-white/10">
            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
            <span className="text-white/90">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Bookmark Button */}
        {showBookmark && (
          <button
            onClick={handleBookmark}
            className={cn(
              "absolute bottom-2 right-2 bg-black/60 p-1.5 rounded-full border border-white/10",
              bookmarked
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            )}
          >
            {bookmarked ? (
              <BookmarkCheck className="w-3.5 h-3.5" style={{ color: "var(--dynamic-primary, #E53935)" }} />
            ) : (
              <Bookmark className="w-3.5 h-3.5 text-white/70" />
            )}
          </button>
        )}
      </div>

      {/* Info */}
      <div className={cn("p-2.5", compact && "p-2")}>
        <h3 className={cn(
          "font-medium line-clamp-1 text-white/90",
          compact ? "text-[11px] leading-tight" : "text-xs leading-snug"
        )}>
          {displayTitle}
        </h3>
        {year && (
          <p className="text-[10px] text-white/35 mt-0.5">{year}</p>
        )}
      </div>
    </Link>
  );
}
