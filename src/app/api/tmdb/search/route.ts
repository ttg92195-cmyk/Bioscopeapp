import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function GET(request: NextRequest) {
  try {
    if (!TMDB_API_KEY) {
      return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const type = searchParams.get('type') || 'movie';

    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }

    const endpoint = type === 'tv' ? '/search/tv' : '/search/movie';
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      query: query,
      include_adult: 'false',
    });

    const res = await fetch(`${TMDB_BASE}${endpoint}?${params.toString()}`);
    const data = await res.json();

    return NextResponse.json({
      results: data.results || [],
      totalResults: data.total_results || 0,
    });
  } catch (error) {
    console.error('TMDB Search error:', error);
    return NextResponse.json({ error: 'Failed to search TMDB' }, { status: 500 });
  }
}
