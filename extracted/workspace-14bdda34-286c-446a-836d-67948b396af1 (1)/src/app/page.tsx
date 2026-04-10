'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import MovieGrid from './components/movie/MovieGrid';
import { useSettingsStore } from '@/lib/store';
import { ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  return (
    <main className="pt-2 pb-20">
      {/* Search Results Info */}
      {searchQuery && (
        <div className="px-4 mb-4">
          <p className="text-gray-400 text-sm">
            Found {filteredMovies.length + filteredSeries.length} results for "{searchQuery}"
          </p>
        </div>
      )}

      {/* Movies */}
      {filteredMovies.length > 0 && (
        <MovieGrid title="Movies" movies={filteredMovies} showMore={!searchQuery} moreHref="/movies" />
      )}

      {/* Series */}
      {filteredSeries.length > 0 && (
        <MovieGrid title="Series" movies={filteredSeries} showMore={!searchQuery} moreHref="/series" />
      )}

      {/* Empty */}
      {!loading && filteredMovies.length === 0 && filteredSeries.length === 0 && (
        <div className="text-center py-16 px-4">
          <p className="text-gray-400 mb-2">
            {searchQuery ? `No results for "${searchQuery}"` : 'No content yet'}
          </p>
          <p className="text-sm text-gray-500">
            {!searchQuery && 'Use TMDB Generator to import content'}
          </p>
        </div>
      )}
    </main>
  );
}

export default function Home() {
  const { primaryColor } = useSettingsStore();

  return (
    <div className="min-h-screen bg-[#121212]">
      <Sidebar />
      <Header />
      <Suspense fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
        </div>
      }>
        <HomeContent />
      </Suspense>
      <MobileNav />
    </div>
  );
}
