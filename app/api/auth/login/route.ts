import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Generate a secure secret key for JWT signing
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

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

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    // Get client IP for rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    // Rate limiting check
    const now = Date.now();
    const clientAttempts = rateLimit.get(ip);
    
    if (clientAttempts) {
      // If more than 5 attempts in 15 minutes, block
      if (clientAttempts.count >= 5 && now - clientAttempts.lastAttempt < 15 * 60 * 1000) {
        return NextResponse.json(
          { success: false, error: 'Too many attempts. Please try again in 15 minutes.' },
          { status: 429 }
        );
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
    
    // Get admin password from server-side environment variable
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Verify password
    if (password !== adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }
    
    // Create JWT token
    const token = await new SignJWT({ 
      authenticated: true,
      role: 'admin',
      timestamp: Date.now()
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);
    
    // Create response with HTTP-only cookie
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });
    
    // Reset rate limit on successful login
    rateLimit.delete(ip);
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Logout endpoint
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin-token');
  return response;
}
