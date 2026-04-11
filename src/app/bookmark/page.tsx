'use client';

import { Suspense, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import MovieGrid from '../components/movie/MovieGrid';
import Pagination from '../components/movie/Pagination';
import SkeletonGrid from '../components/movie/SkeletonGrid';
import { useUserStore } from '@/lib/store';
import { Bookmark } from 'lucide-react';

const ITEMS_PER_PAGE = 30;

function BookmarkContent() {
  const { bookmarkedMovies } = useUserStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) || 1 : 1;

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

  const totalPages = Math.ceil(movies.length / ITEMS_PER_PAGE);

  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return movies.slice(start, start + ITEMS_PER_PAGE);
  }, [movies, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    router.push(`/bookmark?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [router, searchParams]);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 px-4 mb-4">
        <h1 className="text-xl font-bold">Bookmark</h1>
        <span className="text-sm text-gray-400">({movies.length})</span>
      </div>

      <div className="px-4">
        {movies.length > 0 ? (
          <>
            <MovieGrid movies={paginatedMovies} />
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
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
    </>
  );
}

export default function BookmarkPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Sidebar />
      <Header showSearch={false} />

      <main className="pt-4 pb-20">
        <Suspense fallback={<SkeletonGrid count={10} />}>
          <BookmarkContent />
        </Suspense>
      </main>

      <MobileNav />
    </div>
  );
}
