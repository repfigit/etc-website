/**
 * Cache utilities for API responses
 * Provides consistent caching strategies across the application
 */

export const CacheConfig = {
  // Static content (rarely changes)
  STATIC: {
    revalidate: 3600, // 1 hour
    tags: ['static']
  },
  
  // Dynamic content (changes frequently)
  DYNAMIC: {
    revalidate: 60, // 1 minute
    tags: ['dynamic']
  },
  
  // Real-time content (always fresh)
  REALTIME: {
    revalidate: 0, // No cache
    tags: ['realtime']
  },
  
  // Events (moderate update frequency)
  EVENTS: {
    revalidate: 10, // 10 seconds - short cache to show updates quickly
    tags: ['events']
  },
  
  // Resources (moderate update frequency)
  RESOURCES: {
    revalidate: 300, // 5 minutes
    tags: ['resources']
  },
  
  // Tech list (rarely changes)
  TECH_LIST: {
    revalidate: 600, // 10 minutes
    tags: ['tech-list']
  }
};

/**
 * Create cache headers for API responses
 */
export function createCacheHeaders(config: { revalidate: number }) {
  const maxAge = config.revalidate;
  
  if (maxAge === 0) {
    return {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }
  
  return {
    'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`
  };
}

/**
 * Add cache headers to a Next.js Response
 */
export function addCacheHeaders(
  response: Response, 
  config: { revalidate: number }
): Response {
  const headers = createCacheHeaders(config);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}
