import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function GET(request: NextRequest) {
  try {
    if (!TMDB_API_KEY) {
      return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'movie';
    const count = Math.min(parseInt(searchParams.get('count') || '20'), 500);
    const year = searchParams.get('year');
    const genre = searchParams.get('genre');

    const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie';
    const totalPagesNeeded = Math.ceil(count / 20);

    // Fetch multiple pages concurrently (max 25 pages = 500 results)
    const pagesToFetch = Math.min(totalPagesNeeded, 25);
    const pagePromises = Array.from({ length: pagesToFetch }, (_, i) => {
      const params = new URLSearchParams({
        api_key: TMDB_API_KEY,
        page: String(i + 1),
        sort_by: 'popularity.desc',
        include_adult: 'false',
      });
      if (year && year !== 'all') {
        if (type === 'tv') {
          params.append('first_air_date_year', year);
        } else {
          params.append('primary_release_year', year);
        }
      }
      if (genre && genre !== 'all') {
        params.append('with_genres', genre);
      }
      return fetch(`${TMDB_BASE}${endpoint}?${params.toString()}`).then(r => r.json());
    });

    const pageResults = await Promise.all(pagePromises);

    // Combine all results and slice to requested count
    const allResults: any[] = [];
    for (const page of pageResults) {
      if (page.results) {
        allResults.push(...page.results);
      }
    }

    return NextResponse.json({
      results: allResults.slice(0, count),
      totalResults: allResults.length,
    });
  } catch (error) {
    console.error('TMDB Discover error:', error);
    return NextResponse.json({ error: 'Failed to fetch from TMDB' }, { status: 500 });
  }
}
