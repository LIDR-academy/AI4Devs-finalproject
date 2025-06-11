import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTransition = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Start loading when location changes
    setIsLoading(true);
    
    // Set a 1-second delay for the loading state
    // This gives a nice visual feedback for page transitions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Cleanup timer on unmount or location change
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return { isLoading };
}; 