'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MovieDetail from '../../components/movie/MovieDetail';
import Sidebar from '../../components/layout/Sidebar';
import MobileNav from '../../components/layout/MobileNav';
import { useUserStore, useSettingsStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

interface DownloadLink {
  id: string;
  server: string;
  size: string;
  resolution: string;
  url: string;
  linkText: string;
}

interface VideoServer {
  id: string;
  name: string;
  url: string;
}

interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  stillPath: string | null;
  downloadLinks?: DownloadLink[];
  videoServers?: VideoServer[];
}

interface Season {
  id: string;
  seasonNumber: number;
  name: string;
  episodes: Episode[];
}

interface Movie {
  id: string;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  rating: number;
  runtime: number | null;
  type: 'movie' | 'series';
  genres: string[];
  quality: string | null;
  downloadLinks: DownloadLink[];
  videoServers?: VideoServer[];
  seasons: Season[];
}

export default function MovieDetailPage() {
  const params = useParams();
  const { isAdmin } = useUserStore();
  const { primaryColor } = useSettingsStore();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchMovie() {
      try {
        setLoading(true);
        setError(false);

        const res = await fetch(`/api/movies/${params.id}`);

        if (!res.ok) {
          throw new Error('Movie not found');
        }

        const data = await res.json();
        setMovie(data.movie);
      } catch (err) {
        console.error('Failed to fetch movie:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchMovie();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <Sidebar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h1 className="text-2xl font-bold mb-2">Movie Not Found</h1>
          <p className="text-gray-400">The movie you are looking for does not exist.</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <Sidebar />
      <MovieDetail movie={movie} isAdmin={isAdmin} />
      <MobileNav />
    </div>
  );
}
