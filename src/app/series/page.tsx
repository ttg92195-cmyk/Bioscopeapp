'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import MovieGrid from '../components/movie/MovieGrid';
import { useSettingsStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import SkeletonGrid from '../components/movie/SkeletonGrid';

const genres = [
  'All', 'Action & Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Kids', 'Mystery',
  'News', 'Reality', 'Sci-Fi & Fantasy', 'Soap', 'Talk', 'War & Politics'
];

const ITEMS_PER_PAGE = 24;

interface Series {
  id: string;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  rating: number;
  type: string;
  quality: string | null;
  genres: string;
}

function SeriesContent() {
  const { primaryColor } = useSettingsStore();
  const searchParams = useSearchParams();
  const genreFromUrl = searchParams.get('genre');

  const [series, setSeries] = useState<Series[]>([]);
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
    async function fetchSeries() {
      try {
        setLoading(true);
        const res = await fetch('/api/movies?type=series&limit=10000');
        if (res.ok) {
          const data = await res.json();
          setSeries(data.movies || []);
        }
      } catch (error) {
        console.error('Failed to fetch series:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSeries();
  }, []);

  const filteredSeries = useMemo(() => {
    let filtered = series.map((s) => ({
      ...s,
      year: s.releaseDate?.split('-')[0] || '',
      type: 'series' as const,
    }));

    if (searchQuery) {
      filtered = filtered.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedGenre !== 'All') {
      filtered = filtered.filter((s) => {
        try {
          const seriesGenres = JSON.parse(s.genres || '[]');
          return seriesGenres.includes(selectedGenre);
        } catch {
          return false;
        }
      });
    }

    return filtered;
  }, [series, searchQuery, selectedGenre]);

  const totalPages = Math.ceil(filteredSeries.length / ITEMS_PER_PAGE);
  const paginatedSeries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSeries.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSeries, currentPage]);

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

  return (
    <>
      <div className="px-4 mb-4">
        <h1 className="text-2xl font-bold mb-4">Series ({filteredSeries.length})</h1>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search series..."
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
              style={selectedGenre === genre ? { backgroundColor: primaryColor } : { borderColor: '#2D2D2D' }}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </Button>
          ))}
        </div>
      </div>

      {loading && <SkeletonGrid count={12} />}

      {!loading && <MovieGrid movies={paginatedSeries} />}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 py-4">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {getPageNumbers().map((page, i) => (
            <Button key={i} variant={page === currentPage ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0"
              style={page === currentPage ? { backgroundColor: primaryColor } : {}}
              onClick={() => typeof page === 'number' && goToPage(page)} disabled={typeof page === 'string'}>
              {page}
            </Button>
          ))}

          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {!loading && filteredSeries.length === 0 && (
        <div className="text-center py-16 px-4">
          <p className="text-gray-400 mb-2">No series found</p>
          <p className="text-sm text-gray-500">
            {series.length === 0
              ? 'Use TMDB Generator to import series'
              : 'Try a different search or filter'}
          </p>
        </div>
      )}
    </>
  );
}

export default function SeriesPage() {
  const { primaryColor } = useSettingsStore();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <Header searchPlaceholder="Search Series..." />

      <main className="pt-4 pb-20">
        <Suspense fallback={<SkeletonGrid count={12} />}>
          <SeriesContent />
        </Suspense>
      </main>

      <MobileNav />
    </div>
  );
}
