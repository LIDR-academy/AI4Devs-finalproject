import { useCallback, useState } from 'react';

interface UseApiCallOptions {
  retries?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface UseApiCallReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useApiCall = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiCallOptions = {}
): UseApiCallReturn<T> => {
  const {
    retries = 3,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    setLoading(true);
    setError(null);

    let lastError: any;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await apiFunction(...args);
        setData(result);
        setLoading(false);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err: any) {
        lastError = err;
        
        // Don't retry on rate limit errors (429) or client errors (4xx)
        const statusCode = err?.response?.status;
        if (statusCode === 429 || (statusCode >= 400 && statusCode < 500)) {
          console.warn(`API call failed with status ${statusCode}, not retrying:`, err);
          break;
        }
        
        // If this is the last attempt, don't retry
        if (attempt === retries) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        const waitTime = retryDelay * Math.pow(2, attempt);
        await delay(waitTime);
        
        console.warn(`API call attempt ${attempt + 1} failed, retrying in ${waitTime}ms...`, err);
      }
    }

    // All retries failed or non-retryable error
    const errorMessage = lastError?.response?.status === 429 
      ? 'Too many requests. Please wait a moment and try again.'
      : lastError?.response?.data?.error || 
        lastError?.message || 
        'An unexpected error occurred';
    
    setError(errorMessage);
    setLoading(false);
    
    if (onError) {
      onError(lastError);
    }
    
    throw lastError;
  }, [apiFunction, retries, retryDelay, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}; 