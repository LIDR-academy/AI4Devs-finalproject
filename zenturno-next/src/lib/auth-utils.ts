import { createClient } from './supabase/client';

/**
 * Utility to synchronize session state across memory, localStorage, and cookies
 * This helps prevent inconsistencies that can lead to auth errors
 */
export const synchronizeSession = async () => {
  try {
    console.log('Synchronizing session state...');
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) {
      console.log('No valid session found during synchronization');
      
      // Only clear auth data if we're in a browser context
      // This prevents unnecessary clearing during SSR
      if (typeof window !== 'undefined') {
        console.log('In browser context, cleaning up stale auth data');
        clearAuthData();
      } else {
        console.log('In server context, skipping auth data cleanup');
      }
      
      return null;
    }
    
    // Session exists, log some details for debugging
    console.log('Valid session found:', {
      userId: data.session.user.id,
      expiresAt: new Date(data.session.expires_at! * 1000).toISOString(),
      provider: data.session.user.app_metadata.provider,
    });
    
    return data.session;
  } catch (error) {
    console.warn('Session synchronization failed:', error);
    return null;
  }
};

/**
 * Utility to clear all auth-related data from localStorage and cookies
 * This provides a clean slate when auth errors occur
 */
export const clearAuthData = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // We're in a server context, do nothing
    console.log('Skipping clearAuthData in server context');
    return;
  }
  
  // Clear cookies with various path/domain combinations
  const cookieOptions = [
    { path: '/' },
    { path: '/', domain: window.location.hostname },
    { path: '/api' },
    { path: '/api', domain: window.location.hostname },
    { path: '/auth' },
    { path: '/auth', domain: window.location.hostname },
    {}  // Default options
  ];
  
  const cookieNames = [
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token',
    '__session',
    'sb-provider-token',
    'sb-auth-token'
  ];
  
  // Clear all cookies with all option combinations
  cookieNames.forEach(name => {
    cookieOptions.forEach(options => {
      document.cookie = `${name}=; max-age=0; ${options.path ? `path=${options.path};` : ''} ${options.domain ? `domain=${options.domain};` : ''}`;
    });
  });
  
  // Clear localStorage - be thorough with all possible keys
  const keysToRemove = [
    'supabase.auth.token',
    'supabase-auth-token',
    'sb-provider-token',
    'supabase-auth-state',
    'sb-access-token',
    'sb-refresh-token',
    'supabase.auth.refreshToken',
    'supabase.auth.accessToken',
    'supabase.auth.expiresAt'
  ];
  
  // Clear all localStorage items that start with supabase or sb-
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('supabase') || key.startsWith('sb-'))) {
      keysToRemove.push(key);
    }
  }
  
  // Remove all identified keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
};

/**
 * Utility to create an API request wrapper that handles auth errors
 * @param fetcher The fetch function to wrap
 * @returns A wrapped fetch function that handles auth errors
 */
export const createAuthenticatedFetcher = (fetcher: typeof fetch) => {
  return async (url: RequestInfo | URL, options?: RequestInit) => {
    try {
      // Validate session before making API call
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        // If no valid session, throw an error that will be caught by the error boundary
        throw new Error('No valid session found');
      }
      
      // Make the API call
      const response = await fetcher(url, options);
      
      // Check for auth-related errors in the response
      if (response.status === 401) {
        // Unauthorized - session might be invalid
        const responseData = await response.json().catch(() => ({}));
        
        if (responseData.code === 'session_not_found' || 
            responseData.message?.includes('session not found')) {
          console.warn('API call failed due to invalid session');
          clearAuthData();
          
          // This error will be caught by the AuthErrorBoundary
          throw new Error('session_not_found');
        }
      }
      
      return response;
    } catch (error: any) {
      // If it's an auth error, let it propagate to be caught by the error boundary
      if (error.message === 'session_not_found' || 
          error.message === 'No valid session found') {
        throw error;
      }
      
      // For other errors, log and rethrow
      console.error('API call failed:', error);
      throw error;
    }
  };
};
