import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

export const maxDuration = 60;

interface TMDBMovieDetail {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  runtime?: number;
  genres: { id: number; name: string }[];
  number_of_seasons?: number;
}

async function fetchTMDB<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  return res.json();
}

// Process items concurrently with limited parallelism
async function parallelProcess<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  concurrency: number
): Promise<void> {
  const results: Promise<void>[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = batch.map(item => fn(item).catch(err => {
      console.error('Parallel process error:', err);
    }));
    results.push(...batchResults);
    // Wait for each batch before starting next
    await Promise.allSettled(batchResults);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!TMDB_API_KEY) {
      return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
    }

    // Test DB connection
    try {
      await db.movie.count();
    } catch (dbError: any) {
      return NextResponse.json({ error: `Database connection failed: ${dbError?.message || 'Unknown'}` }, { status: 500 });
    }

    const body = await request.json();
    const { ids, type } = body as { ids: number[]; type: 'movie' | 'tv' };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }

    // Check existing IDs in one query
    const existingMovies = await db.movie.findMany({
      where: { tmdbId: { in: ids } },
      select: { tmdbId: true },
    });
    const existingIds = new Set(existingMovies.map(m => m.tmdbId));
    const newIds = ids.filter(id => !existingIds.has(id));

    if (newIds.length === 0) {
      return NextResponse.json({ imported: 0, skipped: ids.length, failed: 0 });
    }

    let imported = 0;
    let failed = 0;

    // Process movies in parallel (5 at a time)
    const isMovie = type === 'movie';

    await parallelProcess(newIds, async (tmdbId) => {
      try {
        const detail = await fetchTMDB<TMDBMovieDetail>(
          `${TMDB_BASE}/${isMovie ? 'movie' : 'tv'}/${tmdbId}?api_key=${TMDB_API_KEY}`
        );

        const title = detail.title || detail.name || 'Unknown';
        const releaseDate = detail.release_date || detail.first_air_date || null;
        const genreNames = detail.genres.map(g => g.name);

        const movie = await db.movie.create({
          data: {
            tmdbId: detail.id,
            title,
            overview: detail.overview || '',
            posterPath: detail.poster_path,
            backdropPath: detail.backdrop_path,
            releaseDate,
            rating: detail.vote_average || 0,
            runtime: detail.runtime || null,
            type: isMovie ? 'movie' : 'series',
            genres: JSON.stringify(genreNames),
          },
        });

        // For TV: fetch seasons in parallel (max 5)
        if (!isMovie && detail.number_of_seasons) {
          const maxSeasons = Math.min(detail.number_of_seasons, 10);
          const seasonNumbers = Array.from({ length: maxSeasons }, (_, i) => i + 1);

          await parallelProcess(seasonNumbers, async (s) => {
            try {
              const seasonDetail = await fetchTMDB<any>(
                `${TMDB_BASE}/tv/${tmdbId}/season/${s}?api_key=${TMDB_API_KEY}`
              );

              const season = await db.season.create({
                data: {
                  movieId: movie.id,
                  seasonNumber: seasonDetail.season_number,
                  name: seasonDetail.name,
                  overview: seasonDetail.overview || null,
                  posterPath: seasonDetail.poster_path,
                },
              });

              if (seasonDetail.episodes?.length > 0) {
                await db.episode.createMany({
                  data: seasonDetail.episodes.map((ep: any) => ({
                    seasonId: season.id,
                    episodeNumber: ep.episode_number,
                    title: ep.name || `Episode ${ep.episode_number}`,
                    overview: ep.overview || null,
                    stillPath: ep.still_path,
                    runtime: ep.runtime || null,
                  })),
                });
              }
            } catch (seasonErr) {
              console.error(`Season ${s} failed for TV ${tmdbId}:`, seasonErr);
            }
          }, 3); // 3 seasons in parallel
        }

        imported++;
      } catch (err) {
        console.error(`Failed to import TMDB ID ${tmdbId}:`, err);
        failed++;
      }
    }, isMovie ? 5 : 3); // 5 movies or 3 TV series in parallel

    return NextResponse.json({
      imported,
      skipped: ids.length - newIds.length,
      failed,
    });
  } catch (error: any) {
    console.error('TMDB Import error:', error);
    return NextResponse.json({ error: `Failed to import: ${error?.message || 'Unknown'}` }, { status: 500 });
  }
}
