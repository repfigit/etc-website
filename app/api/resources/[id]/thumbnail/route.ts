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
    
    if (!resource || !resource.thumbnail || !resource.thumbnail.data) {
      return NextResponse.json(
        { success: false, error: 'Thumbnail not found' },
        { status: 404 }
      );
    }
    
    // Return the image with appropriate headers
    return new NextResponse(resource.thumbnail.data, {
      status: 200,
      headers: {
        'Content-Type': resource.thumbnail.contentType,
        'Content-Length': resource.thumbnail.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    logger.error('Error fetching thumbnail', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch thumbnail' },
      { status: 500 }
    );
  }
}
