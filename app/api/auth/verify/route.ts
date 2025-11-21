import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    
    if (auth && auth.authenticated) {
      return NextResponse.json({ 
        success: true, 
        authenticated: true,
        role: auth.role 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      authenticated: false 
    }, { status: 401 });
    
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ 
      success: false, 
      authenticated: false 
    }, { status: 401 });
  }
}
