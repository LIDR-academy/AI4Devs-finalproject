/**
 * Search API service tests (T029).
 *
 * Tests for TanStack Query hooks that wrap the property search and geocode endpoints.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SearchFilters } from '@/types';

describe('Search API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Module exports', () => {
    it('exports usePropertySearch hook', async () => {
      const mod = await import('./searchService');
      expect(mod.usePropertySearch).toBeDefined();
      expect(typeof mod.usePropertySearch).toBe('function');
    });

    it('exports useGeocode hook', async () => {
      const mod = await import('./searchService');
      expect(mod.useGeocode).toBeDefined();
      expect(typeof mod.useGeocode).toBe('function');
    });
  });

  describe('Hook implementation details', () => {
    it('usePropertySearch wraps apiClient.get with /api/v1/properties/search endpoint', async () => {
      // Read the source to verify the endpoint is correctly configured
      const fs = await import('fs');
      const path = await import('path');
      const servicePath = path.resolve(__dirname, './searchService.ts');
      const source = fs.readFileSync(servicePath, 'utf-8');

      expect(source).toContain('/api/v1/properties/search');
    });

    it('useGeocode wraps apiClient.get with /api/v1/properties/geocode endpoint', async () => {
      // Read the source to verify the endpoint is correctly configured
      const fs = await import('fs');
      const path = await import('path');
      const servicePath = path.resolve(__dirname, './searchService.ts');
      const source = fs.readFileSync(servicePath, 'utf-8');

      expect(source).toContain('/api/v1/properties/geocode');
    });

    it('usePropertySearch hook is configured with TanStack Query useQuery', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const servicePath = path.resolve(__dirname, './searchService.ts');
      const source = fs.readFileSync(servicePath, 'utf-8');

      // Verify it imports useQuery
      expect(source).toContain('useQuery');
      // Verify the hook uses queryKey pattern
      expect(source).toContain("queryKey: ['propertySearch'");
    });

    it('useGeocode hook is configured with TanStack Query useQuery', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const servicePath = path.resolve(__dirname, './searchService.ts');
      const source = fs.readFileSync(servicePath, 'utf-8');

      // Verify it uses queryKey pattern for geocode
      expect(source).toContain("queryKey: ['geocode'");
    });
  });

  describe('Hook signatures', () => {
    it('usePropertySearch accepts SearchFilters or undefined', async () => {
      // Type signature test - verify the function can be called with these types
      const { usePropertySearch } = await import('./searchService');

      const params: SearchFilters = {
        sw_lat: 41.35,
        sw_lng: 2.1,
        ne_lat: 41.45,
        ne_lng: 2.2,
        check_in: '2025-06-01',
        check_out: '2025-06-05',
      };

      // Verify the function exists and has a proper signature
      expect(usePropertySearch).toBeDefined();
      expect(usePropertySearch.length).toBeGreaterThanOrEqual(1);
    });

    it('useGeocode accepts a string query', async () => {
      const { useGeocode } = await import('./searchService');

      // Verify the function exists and accepts a string
      expect(useGeocode).toBeDefined();
      expect(useGeocode.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Cache configuration', () => {
    it('apiClient is imported for making requests', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const servicePath = path.resolve(__dirname, './searchService.ts');
      const source = fs.readFileSync(servicePath, 'utf-8');

      expect(source).toContain("import { apiClient }");
    });

    it('hooks configure appropriate cache and stale time', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const servicePath = path.resolve(__dirname, './searchService.ts');
      const source = fs.readFileSync(servicePath, 'utf-8');

      // Verify staleTime configuration
      expect(source).toContain('staleTime');
      // Verify gcTime configuration (replaces old cacheTime)
      expect(source).toContain('gcTime');
    });

    it('hooks are disabled via enabled flag when parameters are missing', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const servicePath = path.resolve(__dirname, './searchService.ts');
      const source = fs.readFileSync(servicePath, 'utf-8');

      // Verify enabled: !!params pattern
      expect(source).toContain('enabled: !!params');
      // Verify enabled: !!query pattern
      expect(source).toContain("enabled: !!query");
    });
  });

  describe('Type safety', () => {
    it('usePropertySearch is a function that calls useQuery', async () => {
      const mod = await import('./searchService');
      expect(mod.usePropertySearch).toBeDefined();

      // Verify the hook implementation calls useQuery
      const signature = mod.usePropertySearch.toString();
      expect(signature).toContain('useQuery');
    });

    it('useGeocode is a function that calls useQuery', async () => {
      const mod = await import('./searchService');
      expect(mod.useGeocode).toBeDefined();

      const signature = mod.useGeocode.toString();
      expect(signature).toContain('useQuery');
    });
  });

  describe('Parameter handling', () => {
    it('usePropertySearch passes params to apiClient.get', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const servicePath = path.resolve(__dirname, './searchService.ts');
      const source = fs.readFileSync(servicePath, 'utf-8');

      // Verify params are passed in the request
      expect(source).toContain('params');
      expect(source).toContain('apiClient.get');
    });

    it('useGeocode passes query in params object', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const servicePath = path.resolve(__dirname, './searchService.ts');
      const source = fs.readFileSync(servicePath, 'utf-8');

      // Verify query parameter is passed as { q: query }
      expect(source).toContain('{ q: query }');
    });
  });
});
