import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Generate a secure secret key for JWT verification
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface AuthPayload {
  authenticated: boolean;
  role: string;
  timestamp: number;
}

export async function verifyAuth(request: NextRequest): Promise<AuthPayload | null> {
  try {
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return null;
    }
    
    const { payload } = await jwtVerify(token, secret);
    
    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }
    
    // Check if token is too old (optional additional security)
    const tokenAge = Date.now() - (payload.timestamp as number);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (tokenAge > maxAge) {
      return null;
    }
    
    return payload as unknown as AuthPayload;
    
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthPayload> {
  const auth = await verifyAuth(request);
  
  if (!auth || !auth.authenticated) {
    throw new Error('Unauthorized');
  }
  
  return auth;
}
