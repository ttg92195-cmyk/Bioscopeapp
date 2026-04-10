import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');
    const genre = searchParams.get('genre');

    const where: any = {};
    if (type) {
      where.type = type;
    }
    if (genre) {
      where.genres = { contains: genre };
    }

    const movies = await db.movie.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        tmdbId: true,
        title: true,
        posterPath: true,
        backdropPath: true,
        releaseDate: true,
        rating: true,
        runtime: true,
        type: true,
        genres: true,
        quality: true,
        overview: true,
      },
    });

    return NextResponse.json({ movies });
  } catch (error) {
    console.error('Movies list error:', error);
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}
