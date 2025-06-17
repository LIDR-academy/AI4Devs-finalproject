import { createAuthenticatedFetcher } from '@/lib/auth-utils';

/**
 * Custom hook that provides an authenticated fetch function
 * This automatically validates the session before making API calls
 * and handles auth-related errors appropriately
 * 
 * @returns A wrapped fetch function that handles auth errors
 */
export const useAuthenticatedFetch = () => {
  return createAuthenticatedFetcher(fetch);
};

/**
 * Example usage:
 * 
 * ```tsx
 * import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
 * 
 * const MyComponent = () => {
 *   const authFetch = useAuthenticatedFetch();
 *   
 *   const fetchData = async () => {
 *     try {
 *       const response = await authFetch('/api/data');
 *       const data = await response.json();
 *       // Handle successful response
 *     } catch (error) {
 *       // Auth errors are automatically handled by the AuthErrorBoundary
 *       // Only handle other types of errors here
 *       console.error('API error:', error);
 *     }
 *   };
 *   
 *   return <button onClick={fetchData}>Fetch Data</button>;
 * };
 * ```
 */
