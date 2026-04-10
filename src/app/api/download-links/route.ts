import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { server, size, resolution, url, linkText, movieId, episodeId } = body;

    if (!server || !size || !resolution || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!movieId && !episodeId) {
      return NextResponse.json({ error: 'Must provide movieId or episodeId' }, { status: 400 });
    }

    const downloadLink = await db.downloadLink.create({
      data: {
        server,
        size,
        resolution,
        url,
        linkText: linkText || 'Download',
        movieId: movieId || null,
        episodeId: episodeId || null,
      },
    });

    return NextResponse.json({ downloadLink });
  } catch (error) {
    console.error('Create download link error:', error);
    return NextResponse.json({ error: 'Failed to create download link' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await db.downloadLink.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete download link error:', error);
    return NextResponse.json({ error: 'Failed to delete download link' }, { status: 500 });
  }
}
