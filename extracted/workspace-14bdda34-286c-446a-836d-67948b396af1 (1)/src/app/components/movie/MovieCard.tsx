'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Bookmark, BookmarkCheck } from 'lucide-react';
import { useUserStore, useSettingsStore, StoredMovie } from '@/lib/store';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  id: string;
  title: string;
  posterPath: string | null;
  year?: string;
  rating?: number;
  quality?: string;
  type?: 'movie' | 'series';
  showBookmark?: boolean;
  compact?: boolean; // Smaller card size
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
  const { primaryColor } = useSettingsStore();
  const bookmarked = isBookmarked(id);
  
  // Ensure title is never empty for alt text
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
      // Create stored movie object
      const storedMovie: StoredMovie = {
        id,
        title: displayTitle,
        posterPath,
        releaseDate: year ? `${year}-01-01` : null,
        rating,
        type,
        quality,
      };
      addBookmark(storedMovie);
    }
  };

  return (
    <Link
      href={type === 'series' ? `/series/${id}` : `/movie/${id}`}
      className="movie-card group relative block rounded-md overflow-hidden bg-[#1E1E1E]"
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
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 poster-overlay opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Quality Badge */}
        {quality && (
          <span
            className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-bold rounded"
            style={{ backgroundColor: quality === '4K' ? '#E53935' : '#8B5CF6' }}
          >
            {quality}
          </span>
        )}

        {/* Rating */}
        {rating && (
          <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-black/70 px-1.5 py-0.5 rounded text-[10px]">
            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Bookmark Button */}
        {showBookmark && (
          <button
            onClick={handleBookmark}
            className={cn(
              "absolute top-1 right-1 bg-black/70 p-1 rounded-full transition-opacity",
              bookmarked ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            {bookmarked ? (
              <BookmarkCheck className="w-3 h-3" style={{ color: primaryColor }} />
            ) : (
              <Bookmark className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* Info */}
      <div className={cn("p-2", compact && "p-1.5")}>
        <h3 className={cn(
          "font-medium line-clamp-1 text-white",
          compact ? "text-[11px]" : "text-xs"
        )}>
          {displayTitle}
        </h3>
        {year && (
          <p className="text-[10px] text-gray-400 mt-0.5">{year}</p>
        )}
      </div>
    </Link>
  );
}
