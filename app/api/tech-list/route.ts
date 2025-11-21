import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TechItem from '@/lib/models/TechItem';
import { logger } from '@/lib/logger';
import { CacheConfig, addCacheHeaders } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');
    
    // For admin panel, show all items and sort alphabetically
    // For public, only show visible items in random order
    const filter = admin === 'true' ? {} : { isVisible: true };
    
    let query = TechItem.find(filter);
    
    if (admin === 'true') {
      // Admin view: sort alphabetically
      query = query.sort({ name: 1 });
    } else {
      // Public view: random order (no sorting)
      query = query.sort({ _id: 1 });
    }
    
    const techItems = await query.lean();
    
    const response = NextResponse.json({ success: true, data: techItems });
    
    // Add cache headers for public requests
    if (admin !== 'true') {
      return addCacheHeaders(response, CacheConfig.TECH_LIST);
    }
    
    return response;
  } catch (error) {
    logger.error('Error fetching tech items', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tech items' },
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
    const body = await request.json();
    const techItem = await TechItem.create(body);
    
    return NextResponse.json({ success: true, data: techItem }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    logger.error('Error creating tech item', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tech item' },
      { status: 500 }
    );
  }
}

