import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const movie = await db.movie.findUnique({
      where: { id },
      include: {
        seasons: {
          orderBy: { seasonNumber: 'asc' },
          include: {
            episodes: {
              orderBy: { episodeNumber: 'asc' },
              include: {
                downloadLinks: true,
                videoServers: true,
              },
            },
          },
        },
        downloadLinks: true,
        videoServers: true,
      },
    });

    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    // Parse genres from JSON string to array
    let genres: string[] = [];
    try {
      genres = JSON.parse(movie.genres || '[]');
    } catch {
      genres = [];
    }

    return NextResponse.json({
      movie: {
        ...movie,
        genres,
      },
    });
  } catch (error) {
    console.error('Movie detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, overview, quality, runtime, genres } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (overview !== undefined) updateData.overview = overview;
    if (quality !== undefined) updateData.quality = quality === 'none' ? null : quality;
    if (runtime !== undefined) updateData.runtime = runtime ? parseInt(runtime) : null;
    if (genres !== undefined) updateData.genres = JSON.stringify(genres);

    const movie = await db.movie.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ movie });
  } catch (error) {
    console.error('Movie update error:', error);
    return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete all related data first (episodes → seasons → download links → video servers → movie)
    const movie = await db.movie.findUnique({
      where: { id },
      include: {
        seasons: {
          include: {
            episodes: {
              include: {
                downloadLinks: true,
                videoServers: true,
              },
            },
          },
        },
        downloadLinks: true,
        videoServers: true,
      },
    });

    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    // Delete episode download links and video servers
    for (const season of movie.seasons) {
      for (const episode of season.episodes) {
        await db.downloadLink.deleteMany({ where: { episodeId: episode.id } });
        await db.videoServer.deleteMany({ where: { episodeId: episode.id } });
      }
    }

    // Delete movie-level download links and video servers
    await db.downloadLink.deleteMany({ where: { movieId: id } });
    await db.movieVideoServer.deleteMany({ where: { movieId: id } });

    // Delete episodes, seasons, and finally the movie
    for (const season of movie.seasons) {
      await db.episode.deleteMany({ where: { seasonId: season.id } });
    }
    await db.season.deleteMany({ where: { movieId: id } });
    await db.movie.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Movie delete error:', error);
    return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 });
  }
}
