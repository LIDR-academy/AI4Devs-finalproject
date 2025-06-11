import { useCallback, useMemo, useRef, useState } from 'react';

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const performanceRef = useRef<{ [key: string]: number }>({});

  const startMeasure = useCallback((name: string) => {
    performanceRef.current[name] = performance.now();
  }, []);

  const endMeasure = useCallback((name: string) => {
    const start = performanceRef.current[name];
    if (start) {
      const duration = performance.now() - start;
      delete performanceRef.current[name];
      return duration;
    }
    return 0;
  }, []);

  return { startMeasure, endMeasure };
};

// Memory-efficient list virtualization
interface UseVirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualList = <T>(
  items: T[],
  options: UseVirtualListOptions
) => {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(items.length - 1, endIndex + overscan),
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => ({
      item,
      index: visibleRange.start + index,
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
};

// Smart caching hook
interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number;
}

export const useCache = <T>(options: CacheOptions = {}) => {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // 5 minutes default
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const get = useCallback((key: string): T | null => {
    const cached = cacheRef.current.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > ttl) {
      cacheRef.current.delete(key);
      return null;
    }

    return cached.data;
  }, [ttl]);

  const set = useCallback((key: string, data: T) => {
    // Remove oldest entries if cache is full
    if (cacheRef.current.size >= maxSize) {
      const firstKey = cacheRef.current.keys().next().value;
      cacheRef.current.delete(firstKey);
    }

    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, [maxSize]);

  const clear = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const has = useCallback((key: string): boolean => {
    const cached = cacheRef.current.get(key);
    if (!cached) return false;

    // Check if expired
    if (Date.now() - cached.timestamp > ttl) {
      cacheRef.current.delete(key);
      return false;
    }

    return true;
  }, [ttl]);

  return { get, set, clear, has };
};

// Debounced search hook
export const useDebouncedSearch = <T>(
  searchFunction: (query: string) => Promise<T[]>,
  delay: number = 300
) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await searchFunction(searchQuery);
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay);
  }, [searchFunction, delay]);

  return { query, results, loading, search };
};

// Optimized component re-render tracker
export const useRenderTracker = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  renderCount.current += 1;
  const currentTime = Date.now();
  const timeSinceLastRender = currentTime - lastRenderTime.current;
  lastRenderTime.current = currentTime;

  if (process.env.NODE_ENV === 'development') {
    // Removed console.log for cleaner output
  }

  return renderCount.current;
}; 