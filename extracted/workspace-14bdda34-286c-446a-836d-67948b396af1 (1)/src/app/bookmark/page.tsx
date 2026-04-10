'use client';

import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import MovieGrid from '../components/movie/MovieGrid';
import { useUserStore, useSettingsStore } from '@/lib/store';
import { useMemo } from 'react';
import { Bookmark } from 'lucide-react';

export default function BookmarkPage() {
  const { bookmarkedMovies } = useUserStore();
  const { primaryColor } = useSettingsStore();

  // Convert stored movies to MovieGrid format
  const movies = useMemo(() => {
    return bookmarkedMovies.map((m, index) => ({
      id: m.id || `bookmark-${index}`,
      title: m.title || 'Unknown',
      posterPath: m.posterPath,
      year: m.releaseDate?.split('-')[0] || '',
      rating: m.rating || 0,
      type: m.type || 'movie',
      quality: m.quality || null,
    }));
  }, [bookmarkedMovies]);

  return (
    <div className="min-h-screen bg-[#121212]">
      <Sidebar />
      <Header showSearch={false} />

      <main className="pt-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 mb-4">
          <h1 className="text-xl font-bold">Bookmark</h1>
          <span className="text-sm text-gray-400">({movies.length})</span>
        </div>

        <div className="px-4">
          {movies.length > 0 ? (
            <MovieGrid movies={movies} />
          ) : (
            <div className="text-center py-16">
              <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-semibold mb-2">No Bookmarks Yet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Post ထဲ၀င်ပီး Bookmark icon နှိပ်ပီး သိမ်းဆည်းပါ
              </p>
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
