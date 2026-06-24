/**
 * Property API service tests (T042).
 *
 * Tests for TanStack Query hooks wrapping property details, availability,
 * reviews, and price calculation endpoints.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const servicePath = path.resolve(__dirname, './propertyService.ts');
const source = fs.readFileSync(servicePath, 'utf-8');

describe('Property API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Module exports', () => {
    it('exports usePropertyDetails hook', async () => {
      const mod = await import('./propertyService');
      expect(mod.usePropertyDetails).toBeDefined();
      expect(typeof mod.usePropertyDetails).toBe('function');
    });

    it('exports usePropertyAvailability hook', async () => {
      const mod = await import('./propertyService');
      expect(mod.usePropertyAvailability).toBeDefined();
      expect(typeof mod.usePropertyAvailability).toBe('function');
    });

    it('exports usePropertyReviews hook', async () => {
      const mod = await import('./propertyService');
      expect(mod.usePropertyReviews).toBeDefined();
      expect(typeof mod.usePropertyReviews).toBe('function');
    });

    it('exports usePriceCalculation hook', async () => {
      const mod = await import('./propertyService');
      expect(mod.usePriceCalculation).toBeDefined();
      expect(typeof mod.usePriceCalculation).toBe('function');
    });
  });

  describe('Endpoint configuration', () => {
    it('usePropertyDetails uses correct endpoint pattern', () => {
      expect(source).toContain('/api/v1/properties/');
    });

    it('usePropertyAvailability uses availability endpoint', () => {
      expect(source).toContain('/availability');
    });

    it('usePropertyReviews uses reviews endpoint', () => {
      expect(source).toContain('/reviews');
    });

    it('usePriceCalculation uses price endpoint', () => {
      expect(source).toContain('/price');
    });
  });

  describe('Query key patterns', () => {
    it('usePropertyDetails uses propertyDetails query key', () => {
      expect(source).toContain("queryKey: ['propertyDetails'");
    });

    it('usePropertyAvailability uses propertyAvailability query key', () => {
      expect(source).toContain("queryKey: ['propertyAvailability'");
    });

    it('usePropertyReviews uses propertyReviews query key', () => {
      expect(source).toContain("queryKey: ['propertyReviews'");
    });

    it('usePriceCalculation uses priceCalculation query key', () => {
      expect(source).toContain("queryKey: ['priceCalculation'");
    });
  });

  describe('Enabled flags', () => {
    it('usePropertyDetails is disabled when id is empty', () => {
      expect(source).toContain('enabled: !!id');
    });

    it('usePriceCalculation is disabled when dates are empty', () => {
      expect(source).toContain('!!checkIn && !!checkOut');
    });
  });

  describe('Cache configuration', () => {
    it('configures staleTime on all hooks', () => {
      const matches = source.match(/staleTime/g) || [];
      expect(matches.length).toBeGreaterThanOrEqual(4);
    });

    it('configures gcTime on all hooks', () => {
      const matches = source.match(/gcTime/g) || [];
      expect(matches.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('apiClient usage', () => {
    it('imports apiClient for HTTP requests', () => {
      expect(source).toContain("import { apiClient }");
    });

    it('uses apiClient.get for all hooks', () => {
      const matches = source.match(/apiClient\.get/g) || [];
      expect(matches.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Hook implementation', () => {
    it('all hooks call useQuery internally', async () => {
      const mod = await import('./propertyService');

      expect(mod.usePropertyDetails.toString()).toContain('useQuery');
      expect(mod.usePropertyAvailability.toString()).toContain('useQuery');
      expect(mod.usePropertyReviews.toString()).toContain('useQuery');
      expect(mod.usePriceCalculation.toString()).toContain('useQuery');
    });

    it('usePropertyAvailability passes from/to as query params', () => {
      expect(source).toContain('{ from, to }');
    });

    it('usePriceCalculation passes check_in / check_out as query params', () => {
      expect(source).toContain('check_in: checkIn');
      expect(source).toContain('check_out: checkOut');
    });

    it('usePropertyReviews passes page and size as query params', () => {
      expect(source).toContain('{ page, size }');
    });
  });
});
