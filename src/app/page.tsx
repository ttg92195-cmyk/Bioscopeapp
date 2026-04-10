'use client';

import { Suspense, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import MovieGrid from './components/movie/MovieGrid';
import Pagination from './components/movie/Pagination';
import SkeletonGrid from './components/movie/SkeletonGrid';
import { Film, Search } from 'lucide-react';

const SEARCH_ITEMS_PER_PAGE = 30;

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('search') || '';
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) || 1 : 1;

  const [movies, setMovies] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Brief search loading indicator
  useEffect(() => {
    if (searchQuery) {
      setSearchLoading(true);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        setSearchLoading(false);
      }, 100);
    } else {
      setSearchLoading(false);
    }
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

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

  // Combined search results
  const combinedResults = useMemo(() => {
    if (!searchQuery) return [];
    return [...filteredMovies, ...filteredSeries];
  }, [searchQuery, filteredMovies, filteredSeries]);

  const totalSearchPages = Math.ceil(combinedResults.length / SEARCH_ITEMS_PER_PAGE);

  const paginatedResults = useMemo(() => {
    if (!searchQuery) return [];
    const start = (currentPage - 1) * SEARCH_ITEMS_PER_PAGE;
    return combinedResults.slice(start, start + SEARCH_ITEMS_PER_PAGE);
  }, [searchQuery, combinedResults, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    router.push(`/?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [router, searchParams]);

  if (loading) {
    return null;
  }

  return (
    <main className="pt-2 pb-20">
      {/* Search Results */}
      {searchQuery && (
        <>
          <div className="px-4 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Search className="w-4 h-4 text-white/30" />
              <span className="text-sm font-medium text-white/70">
                Results for
              </span>
              {searchLoading && (
                <span className="search-spinner">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </span>
              )}
            </div>
            <p className="text-lg font-semibold text-white pl-6">
              &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="text-xs text-white/30 mt-1 pl-6">
              {combinedResults.length} title{combinedResults.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {paginatedResults.length > 0 ? (
            <MovieGrid movies={paginatedResults} />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-5">
                <Search className="w-7 h-7 text-white/20" />
              </div>
              <p className="text-sm font-medium text-white/50 mb-1.5">
                No results for &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          )}

          {totalSearchPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalSearchPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Normal View (no search) */}
      {!searchQuery && (
        <>
          {/* Movies */}
          {filteredMovies.length > 0 && (
            <MovieGrid title="Movies" movies={filteredMovies.slice(0, 10)} showMore moreHref="/movies" />
          )}

          {/* Series */}
          {filteredSeries.length > 0 && (
            <MovieGrid title="Series" movies={filteredSeries.slice(0, 10)} showMore moreHref="/series" />
          )}

          {/* Empty State */}
          {filteredMovies.length === 0 && filteredSeries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 px-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-5">
                <Film className="w-7 h-7 text-white/20" />
              </div>
              <p className="text-sm font-medium text-white/50 mb-1.5">
                No content yet
              </p>
              <p className="text-xs text-white/25 text-center max-w-[240px]">
                Use the TMDB Generator in the sidebar to import movies and series
              </p>
            </div>
          )}
        </>
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
