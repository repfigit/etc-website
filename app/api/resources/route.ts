import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resource from '@/lib/models/Resource';
import { logger } from '@/lib/logger';
import { CacheConfig, addCacheHeaders } from '@/lib/cache';
import { uploadFileToBlob } from '@/lib/blob';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const featured = searchParams.get('featured');
    const admin = searchParams.get('admin');
    
    // Build query filters
    const filters: any = admin === 'true' ? {} : { isVisible: true };
    if (featured === 'true') {
      filters.featured = true;
    }
    
    let query = Resource.find(filters).sort({ order: 1 });
    
    // Get total count with same filters
    const total = await Resource.countDocuments(filters);
    
    // Apply limit if specified
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const resources = await query.lean();
    
    const response = NextResponse.json({ success: true, data: resources, total });
    
    // Add cache headers for public requests
    if (admin !== 'true') {
      return addCacheHeaders(response, CacheConfig.RESOURCES);
    }
    
    return response;
  } catch (error) {
    logger.error('Error fetching resources', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication for admin operations
    const { requireAuth } = await import('@/lib/auth');
    await requireAuth(request as any);
    
    await connectDB();
    
    const contentType = request.headers.get('content-type') || '';
    let body: any;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with thumbnail
      const formData = await request.formData();
      const thumbnailFile = formData.get('thumbnail') as File;
      
      body = {
        title: formData.get('title'),
        url: formData.get('url'),
        description: formData.get('description'),
        featured: formData.get('featured') === 'true',
        order: parseInt(formData.get('order') as string) || 0,
        isVisible: formData.get('isVisible') === 'true'
      };
      
      // Create resource first to get the ID for blob storage paths
      const resource = await Resource.create(body);
      const resourceId = resource._id.toString();
      
      // Handle thumbnail file
      if (thumbnailFile && thumbnailFile instanceof File && thumbnailFile.size > 0) {
        try {
          const uploadResult = await uploadFileToBlob('resources', resourceId, 'thumbnail', thumbnailFile);
          
          resource.thumbnail = {
            filename: uploadResult.filename,
            url: uploadResult.url,
            contentType: uploadResult.contentType,
            size: uploadResult.size
          };
          
          await resource.save();
          
          logger.debug('Thumbnail uploaded to blob', {
            filename: thumbnailFile.name,
            url: uploadResult.url,
            size: thumbnailFile.size
          });
        } catch (fileError) {
          logger.error('Error uploading thumbnail file', fileError);
        }
      }
      
      return NextResponse.json({ success: true, data: resource }, { status: 201 });
    } else {
      // Handle JSON without thumbnail
      body = await request.json();
      
      const resource = await Resource.create(body);
      
      return NextResponse.json({ success: true, data: resource }, { status: 201 });
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    logger.error('Error creating resource', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}
