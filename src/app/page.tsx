'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import MovieGrid from './components/movie/MovieGrid';
import SkeletonGrid from './components/movie/SkeletonGrid';
import { useSettingsStore } from '@/lib/store';
import { Film, Search } from 'lucide-react';

function HomeContent() {
  const { primaryColor } = useSettingsStore();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [movies, setMovies] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [moviesRes, seriesRes] = await Promise.all([
          fetch('/api/movies?type=movie&limit=100'),
          fetch('/api/movies?type=series&limit=100')
        ]);

        if (moviesRes.ok) {
          const data = await moviesRes.json();
          setMovies(data.movies || []);
        }

        if (seriesRes.ok) {
          const data = await seriesRes.json();
          setSeries(data.movies || []);
        }
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredMovies = useMemo(() => {
    let result = movies.map(m => ({
      ...m,
      year: m.releaseDate?.split('-')[0] || '',
      type: 'movie' as const
    }));
    if (searchQuery) {
      result = result.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [movies, searchQuery]);

  const filteredSeries = useMemo(() => {
    let result = series.map(s => ({
      ...s,
      year: s.releaseDate?.split('-')[0] || '',
      type: 'series' as const
    }));
    if (searchQuery) {
      result = result.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [series, searchQuery]);

  if (loading) {
    return (
      <main className="pt-2 pb-20">
        <SkeletonGrid count={6} />
        <SkeletonGrid count={6} />
      </main>
    );
  }

  return (
    <main className="pt-2 pb-20">
      {/* Search Results Info */}
      {searchQuery && (
        <div className="px-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-4 h-4 text-white/30" />
            <span className="text-sm font-medium text-white/70">
              Results for
            </span>
          </div>
          <p className="text-lg font-semibold text-white pl-6">
            &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs text-white/30 mt-1 pl-6">
            {filteredMovies.length + filteredSeries.length} title{filteredMovies.length + filteredSeries.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}

      {/* Movies */}
      {filteredMovies.length > 0 && (
        <MovieGrid title="Movies" movies={filteredMovies.slice(0, 10)} showMore={!searchQuery} moreHref="/movies" />
      )}

      {/* Series */}
      {filteredSeries.length > 0 && (
        <MovieGrid title="Series" movies={filteredSeries.slice(0, 10)} showMore={!searchQuery} moreHref="/series" />
      )}

      {/* Empty State */}
      {!loading && filteredMovies.length === 0 && filteredSeries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-5">
            {searchQuery ? (
              <Search className="w-7 h-7 text-white/20" />
            ) : (
              <Film className="w-7 h-7 text-white/20" />
            )}
          </div>
          <p className="text-sm font-medium text-white/50 mb-1.5">
            {searchQuery ? `No results for "${searchQuery}"` : 'No content yet'}
          </p>
          <p className="text-xs text-white/25 text-center max-w-[240px]">
            {!searchQuery && 'Use the TMDB Generator in the sidebar to import movies and series'}
          </p>
        </div>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <Header />
      <Suspense fallback={
        <main className="pt-2 pb-20">
          <SkeletonGrid count={6} />
          <SkeletonGrid count={6} />
        </main>
      }>
        <HomeContent />
      </Suspense>
      <MobileNav />
    </div>
  );
}
