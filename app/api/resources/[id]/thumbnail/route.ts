import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resource from '@/lib/models/Resource';
import { logger } from '@/lib/logger';
import { versionedBlobUrl } from '@/lib/blob';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const resource = await Resource.findById(id).select('thumbnail updatedAt');

    if (!resource || !resource.thumbnail || !resource.thumbnail.url) {
      return NextResponse.json(
        { success: false, error: 'Thumbnail not found' },
        { status: 404 }
      );
    }

    // Redirect to the (version-busted) blob URL. The redirect itself must not
    // be cached, or a later image change would never be picked up.
    return NextResponse.redirect(
      versionedBlobUrl(resource.thumbnail.url, resource.updatedAt),
      {
        status: 302,
        headers: {
          'Cache-Control': 'no-store',
        }
      }
    );
  } catch (error) {
    logger.error('Error fetching thumbnail', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch thumbnail' },
      { status: 500 }
    );
  }
}
