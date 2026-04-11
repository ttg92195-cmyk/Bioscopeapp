'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import MovieGrid from '../components/movie/MovieGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import SkeletonGrid from '../components/movie/SkeletonGrid';

const genres = [
  'All', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror',
  'Music', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
];

const ITEMS_PER_PAGE = 24;

interface Movie {
  id: string;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  rating: number;
  type: string;
  quality: string | null;
  genres: string;
}

function MoviesContent() {
  const searchParams = useSearchParams();
  const genreFromUrl = searchParams.get('genre');

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (genreFromUrl && genres.includes(genreFromUrl)) {
      setSelectedGenre(genreFromUrl);
    }
  }, [genreFromUrl]);

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        const res = await fetch('/api/movies?type=movie&limit=10000');
        if (res.ok) {
          const data = await res.json();
          setMovies(data.movies || []);
        }
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);

  const filteredMovies = useMemo(() => {
    let filtered = movies.map((m) => ({
      ...m,
      year: m.releaseDate?.split('-')[0] || '',
      type: 'movie' as const,
    }));

    if (searchQuery) {
      filtered = filtered.filter((m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedGenre !== 'All') {
      filtered = filtered.filter((m) => {
        try {
          const movieGenres = JSON.parse(m.genres || '[]');
          return movieGenres.includes(selectedGenre);
        } catch {
          return false;
        }
      });
    }

    return filtered;
  }, [movies, searchQuery, selectedGenre]);

  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMovies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGenre]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0 });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    return pages;
  };

  if (loading) {
    return null;
  }

  return (
    <>
      <div className="px-4 mb-4">
        <h1 className="text-2xl font-bold mb-4">Movies ({filteredMovies.length})</h1>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1E1E1E] border-none"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {genres.map((genre) => (
            <Button
              key={genre}
              size="sm"
              variant={selectedGenre === genre ? 'default' : 'outline'}
              style={selectedGenre === genre ? { backgroundColor: 'var(--dynamic-primary, #E53935)' } : { borderColor: '#2D2D2D' }}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </Button>
          ))}
        </div>
      </div>

      <MovieGrid movies={paginatedMovies} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 py-4">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {getPageNumbers().map((page, i) => (
            <Button key={i} variant={page === currentPage ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0"
              style={page === currentPage ? { backgroundColor: 'var(--dynamic-primary, #E53935)' } : {}}
              onClick={() => typeof page === 'number' && goToPage(page)} disabled={typeof page === 'string'}>
              {page}
            </Button>
          ))}

          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {filteredMovies.length === 0 && (
        <div className="text-center py-16 px-4">
          <p className="text-gray-400 mb-2">No movies found</p>
          <p className="text-sm text-gray-500">
            {movies.length === 0
              ? 'Use TMDB Generator to import movies'
              : 'Try a different search or filter'}
          </p>
        </div>
      )}
    </>
  );
}

export default function MoviesPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Sidebar />
      <Header searchPlaceholder="Search Movies..." />

      <main className="pt-4 pb-20">
        <Suspense fallback={
          <div className="px-4 mb-4">
            <div className="shimmer rounded h-8 w-40 mb-4" />
            <div className="shimmer rounded h-10 w-full mb-4" />
            <div className="flex gap-2 mb-4">
              <div className="shimmer rounded h-8 w-16" />
              <div className="shimmer rounded h-8 w-20" />
              <div className="shimmer rounded h-8 w-16" />
              <div className="shimmer rounded h-8 w-20" />
              <div className="shimmer rounded h-8 w-24" />
            </div>
          </div>
        }>
          <MoviesContent />
        </Suspense>
      </main>

      <MobileNav />
    </div>
  );
}
