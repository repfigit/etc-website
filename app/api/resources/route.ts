import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resource from '@/lib/models/Resource';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const featured = searchParams.get('featured');
    
    // Build query filters
    const filters: any = { isVisible: true };
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
    
    return NextResponse.json({ success: true, data: resources, total });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const resource = await Resource.create(body);
    
    return NextResponse.json({ success: true, data: resource }, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}

