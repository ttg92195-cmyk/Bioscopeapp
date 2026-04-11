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
import { Clock } from 'lucide-react';

const ITEMS_PER_PAGE = 30;

function RecentContent() {
  const { viewedMovies } = useUserStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) || 1 : 1;

  const movies = useMemo(() => {
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
    router.push(`/recent?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [router, searchParams]);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 px-4 mb-4">
        <h1 className="text-xl font-bold">Recent</h1>
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
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-semibold mb-2">No Recent Views</h3>
            <p className="text-gray-400 text-sm mb-4">
              Movies နှင့် Series ကြည့်ရှုလျှင် ဤနေရာတွင် ပေါ်ပါမည်
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default function RecentPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Sidebar />
      <Header showSearch={false} />

      <main className="pt-4 pb-20">
        <Suspense fallback={<SkeletonGrid count={10} />}>
          <RecentContent />
        </Suspense>
      </main>

      <MobileNav />
    </div>
  );
}
