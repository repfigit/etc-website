import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resource from '@/lib/models/Resource';
import { logger } from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const resource = await Resource.findById(id).select('thumbnail');
    
    if (!resource || !resource.thumbnail || !resource.thumbnail.url) {
      return NextResponse.json(
        { success: false, error: 'Thumbnail not found' },
        { status: 404 }
      );
    }
    
    // Redirect to the blob URL
    return NextResponse.redirect(resource.thumbnail.url, {
      status: 302,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      }
    });
  } catch (error) {
    logger.error('Error fetching thumbnail', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch thumbnail' },
      { status: 500 }
    );
  }
}
