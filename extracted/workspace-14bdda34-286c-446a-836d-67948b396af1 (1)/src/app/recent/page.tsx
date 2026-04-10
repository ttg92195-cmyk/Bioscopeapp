'use client';

import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import MovieGrid from '../components/movie/MovieGrid';
import { useUserStore, useSettingsStore } from '@/lib/store';
import { useMemo } from 'react';
import { Clock } from 'lucide-react';

export default function RecentPage() {
  const { viewedMovies } = useUserStore();
  const { primaryColor } = useSettingsStore();

  // Convert stored movies to MovieGrid format, sorted by viewedAt (newest first)
  const movies = useMemo(() => {
    // viewedMovies is already sorted by most recent first
    return viewedMovies.map((m, index) => ({
      id: m.id || `recent-${index}`,
      title: m.title || 'Unknown',
      posterPath: m.posterPath,
      year: m.releaseDate?.split('-')[0] || '',
      rating: m.rating || 0,
      type: m.type || 'movie',
      quality: m.quality || null,
    }));
  }, [viewedMovies]);

  return (
    <div className="min-h-screen bg-[#121212]">
      <Sidebar />
      <Header showSearch={false} />

      <main className="pt-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 mb-4">
          <h1 className="text-xl font-bold">Recent</h1>
          <span className="text-sm text-gray-400">({movies.length})</span>
        </div>

        <div className="px-4">
          {movies.length > 0 ? (
            <MovieGrid movies={movies} />
          ) : (
            <div className="text-center py-16">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-semibold mb-2">No Recent Views</h3>
              <p className="text-gray-400 text-sm mb-4">
                Movies နှင့် Series ကြည့်ရှုလျှင် ဤနေရာတွင် ပေါ်ပါမည်
              </p>
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
