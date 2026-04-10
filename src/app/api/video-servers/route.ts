import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, movieId, episodeId } = body;

    if (!name || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!movieId && !episodeId) {
      return NextResponse.json({ error: 'Must provide movieId or episodeId' }, { status: 400 });
    }

    // Movie-level video server
    if (movieId) {
      const server = await db.movieVideoServer.create({
        data: { name, url, movieId },
      });
      return NextResponse.json({ server });
    }

    // Episode-level video server
    if (episodeId) {
      const server = await db.videoServer.create({
        data: { name, url, episodeId },
      });
      return NextResponse.json({ server });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Create video server error:', error);
    return NextResponse.json({ error: 'Failed to create video server' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, url, type } = body;

    if (!id || !url || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'movie') {
      const server = await db.movieVideoServer.update({
        where: { id },
        data: { url },
      });
      return NextResponse.json({ server });
    } else if (type === 'episode') {
      const server = await db.videoServer.update({
        where: { id },
        data: { url },
      });
      return NextResponse.json({ server });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Update video server error:', error);
    return NextResponse.json({ error: 'Failed to update video server' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type } = body;

    if (!id || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'movie') {
      await db.movieVideoServer.delete({ where: { id } });
    } else if (type === 'episode') {
      await db.videoServer.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete video server error:', error);
    return NextResponse.json({ error: 'Failed to delete video server' }, { status: 500 });
  }
}
