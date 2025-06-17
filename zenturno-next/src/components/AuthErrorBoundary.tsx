import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Higher-order component that catches and handles authentication errors
 * @param Component The component to wrap with auth error handling
 */
export const withAuthErrorHandling = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const router = useRouter();
    
    useEffect(() => {
      const handleAuthError = (event: PromiseRejectionEvent) => {
        // Check if this is an auth-related error
        const error = event.reason?.error || event.reason;
        
        if (
          error?.code === 'session_not_found' || 
          error?.message?.includes('session not found') ||
          error?.message?.includes('JWT expired') ||
          error?.message?.includes('Invalid JWT')
        ) {
          console.info('Auth session error detected, cleaning up and redirecting to login');
          
          // Clear client-side auth state
          const supabase = createClient();
          
          // Clear cookies
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
          
          cookieNames.forEach(name => {
            cookieOptions.forEach(options => {
              document.cookie = `${name}=; max-age=0; ${options.path ? `path=${options.path};` : ''} ${options.domain ? `domain=${options.domain};` : ''}`;
            });
          });
          
          // Clear localStorage
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('supabase') || key.startsWith('sb-'))) {
              localStorage.removeItem(key);
            }
          }
          
          // Try to sign out but don't wait for it
          supabase.auth.signOut().catch(() => {});
          
          // Redirect to login
          router.replace('/login');
          
          // Prevent the error from propagating
          event.preventDefault();
        }
      };
      
      // Add global error listener
      window.addEventListener('unhandledrejection', handleAuthError);
      
      return () => {
        window.removeEventListener('unhandledrejection', handleAuthError);
      };
    }, [router]);
    
    return <Component {...props} />;
  };
};

/**
 * Component that wraps the application to handle auth errors
 */
export const AuthErrorBoundary: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const router = useRouter();
  
  useEffect(() => {
    const handleAuthError = (event: PromiseRejectionEvent) => {
      // Same logic as in the HOC
      const error = event.reason?.error || event.reason;
      
      if (
        error?.code === 'session_not_found' || 
        error?.message?.includes('session not found') ||
        error?.message?.includes('JWT expired') ||
        error?.message?.includes('Invalid JWT')
      ) {
        console.info('Auth session error detected in boundary, redirecting to login');
        
        // Clear client-side auth state
        const supabase = createClient();
        
        // Try to sign out but don't wait for it
        supabase.auth.signOut().catch(() => {});
        
        // Redirect to login
        router.replace('/login');
        
        // Prevent the error from propagating
        event.preventDefault();
      }
    };
    
    // Add global error listener
    window.addEventListener('unhandledrejection', handleAuthError);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleAuthError);
    };
  }, [router]);
  
  return <>{children}</>;
};

export default AuthErrorBoundary;
