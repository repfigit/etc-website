import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/lib/models/Contact';
import { logger } from '@/lib/logger';

// Rate limiting storage (in production, use Redis or database)
const rateLimit = new Map<string, { count: number; lastAttempt: number }>();

// Clean up old rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimit.entries()) {
    if (now - value.lastAttempt > 15 * 60 * 1000) { // 15 minutes
      rateLimit.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const clientAttempts = rateLimit.get(ip);
  
  if (clientAttempts) {
    // If more than 3 submissions in 15 minutes, block
    if (clientAttempts.count >= 3 && now - clientAttempts.lastAttempt < 15 * 60 * 1000) {
      return false;
    }
    
    // Reset count if 15 minutes have passed
    if (now - clientAttempts.lastAttempt >= 15 * 60 * 1000) {
      rateLimit.set(ip, { count: 1, lastAttempt: now });
    } else {
      rateLimit.set(ip, { count: clientAttempts.count + 1, lastAttempt: now });
    }
  } else {
    rateLimit.set(ip, { count: 1, lastAttempt: now });
  }
  
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Rate limiting check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Basic spam prevention - check message length
    if (message.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Message must be at least 10 characters long' },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Message is too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create contact submission
    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      read: false,
    });

    logger.info('Contact form submission received', {
      id: contact._id,
      email: contact.email,
    });

    return NextResponse.json(
      { success: true, data: { id: contact._id } },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error processing contact form', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: 'Failed to submit message. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// GET endpoint for admin to retrieve contact submissions (requires auth)
export async function GET(request: NextRequest) {
  try {
    // Verify authentication for admin operations
    const { requireAuth } = await import('@/lib/auth');
    await requireAuth(request as any);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    const unreadOnly = searchParams.get('unread') === 'true';

    const query: any = {};
    if (unreadOnly) {
      query.read = false;
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-__v')
      .lean();

    const total = await Contact.countDocuments(query);
    const unreadCount = await Contact.countDocuments({ read: false });

    return NextResponse.json({
      success: true,
      data: contacts,
      total,
      unreadCount,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('Error fetching contact submissions', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact submissions' },
      { status: 500 }
    );
  }
}

