/**
 * Unit tests for RoutingApiService.
 * Tests API calls, caching, error handling, and fallback behavior.
 * Follows TDD: test first, then implement.
 */

import { RoutingApiService, LatLng, RouteResponse } from './routing';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('RoutingApiService', () => {
  let routingService: RoutingApiService;
  const mockOrigin: LatLng = { lat: 41.3851, lng: 2.1734 };
  const mockDestination: LatLng = { lat: 41.4036, lng: 2.1744 };

  beforeEach(() => {
    routingService = new RoutingApiService('/api');
    mockFetch.mockClear();
    routingService.clearCache();
  });

  describe('getRoute', () => {
    it('should fetch route from API and cache result', async () => {
      // Given
      const mockRouteResponse: RouteResponse = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              distance: 5000,
              duration: 600,
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [41.3851, 2.1734],
                [41.3900, 2.1750],
                [41.4036, 2.1744],
              ],
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRouteResponse,
      });

      // When
      const result1 = await routingService.getRoute(mockOrigin, mockDestination);
      const result2 = await routingService.getRoute(mockOrigin, mockDestination);

      // Then
      expect(mockFetch).toHaveBeenCalledTimes(1); // Only called once due to caching
      expect(mockFetch).toHaveBeenCalledWith('/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: mockOrigin,
          destination: mockDestination,
        }),
      });

      expect(result1).toEqual(mockRouteResponse);
      expect(result2).toEqual(mockRouteResponse);
      expect(result1).toBe(result2); // Same object reference due to caching
    });

    it('should return fallback route when API fails', async () => {
      // Given
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // When
      const result = await routingService.getRoute(mockOrigin, mockDestination);

      // Then
      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(1);
      
      const feature = result.features[0];
      expect(feature.type).toBe('Feature');
      expect(feature.geometry.type).toBe('LineString');
      expect(feature.geometry.coordinates).toHaveLength(2);
      expect(feature.geometry.coordinates[0]).toEqual([mockOrigin.lat, mockOrigin.lng]);
      expect(feature.geometry.coordinates[1]).toEqual([mockDestination.lat, mockDestination.lng]);
      
      expect(feature.properties.distance).toBeGreaterThan(0);
      expect(feature.properties.duration).toBeGreaterThan(0);
    });

    it('should return fallback route when API returns error status', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      // When
      const result = await routingService.getRoute(mockOrigin, mockDestination);

      // Then
      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(1);
      expect(result.features[0].geometry.coordinates).toHaveLength(2);
    });

    it('should handle different coordinate pairs separately', async () => {
      // Given
      const differentDestination: LatLng = { lat: 41.5000, lng: 2.2000 };
      
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            type: 'FeatureCollection',
            features: [{ type: 'Feature', properties: { distance: 1000, duration: 120 }, geometry: { type: 'LineString', coordinates: [] } }],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            type: 'FeatureCollection',
            features: [{ type: 'Feature', properties: { distance: 2000, duration: 240 }, geometry: { type: 'LineString', coordinates: [] } }],
          }),
        });

      // When
      const result1 = await routingService.getRoute(mockOrigin, mockDestination);
      const result2 = await routingService.getRoute(mockOrigin, differentDestination);

      // Then
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result1.features[0].properties.distance).toBe(1000);
      expect(result2.features[0].properties.distance).toBe(2000);
    });
  });

  describe('clearCache', () => {
    it('should clear cached routes', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: { distance: 1000, duration: 120 }, geometry: { type: 'LineString', coordinates: [] } }],
        }),
      });

      // When
      await routingService.getRoute(mockOrigin, mockDestination);
      routingService.clearCache();
      await routingService.getRoute(mockOrigin, mockDestination);

      // Then
      expect(mockFetch).toHaveBeenCalledTimes(2); // Called twice because cache was cleared
    });
  });

  describe('fallback route calculation', () => {
    it('should calculate reasonable distance and duration for fallback', async () => {
      // Given
      mockFetch.mockRejectedValueOnce(new Error('API error'));

      // When
      const result = await routingService.getRoute(mockOrigin, mockDestination);

      // Then
      const feature = result.features[0];
      expect(feature.properties.distance).toBeGreaterThan(0);
      expect(feature.properties.duration).toBeGreaterThan(0);
      
      // Distance should be reasonable for Barcelona coordinates
      expect(feature.properties.distance).toBeLessThan(100000); // Less than 100km
      expect(feature.properties.duration).toBeLessThan(7200); // Less than 2 hours
    });

    it('should handle same origin and destination', async () => {
      // Given
      mockFetch.mockRejectedValueOnce(new Error('API error'));

      // When
      const result = await routingService.getRoute(mockOrigin, mockOrigin);

      // Then
      const feature = result.features[0];
      expect(feature.properties.distance).toBe(0);
      expect(feature.properties.duration).toBe(0);
      expect(feature.geometry.coordinates).toEqual([
        [mockOrigin.lat, mockOrigin.lng],
        [mockOrigin.lat, mockOrigin.lng],
      ]);
    });
  });
});
