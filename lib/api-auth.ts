import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from './auth';

export function withAuth(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    try {
      // Verify authentication
      await requireAuth(request);
      
      // If authenticated, proceed with the original handler
      return await handler(request, context);
      
    } catch (error) {
      // Return 401 Unauthorized if authentication fails
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
  };
}

export function withOptionalAuth(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    // Pass authentication status to handler
    const auth = await import('./auth').then(m => m.verifyAuth(request));
    
    // Add auth info to request context
    const enhancedContext = {
      ...context,
      auth: auth
    };
    
    return await handler(request, enhancedContext);
  };
}
