/**
 * API client for routing operations.
 * Follows Single Responsibility Principle: only handles routing API calls.
 * Follows Dependency Inversion Principle: depends on abstractions (fetch).
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteRequest {
  origin: LatLng;
  destination: LatLng;
}

export interface RouteProperties {
  distance: number;
  duration: number;
}

export interface RouteGeometry {
  type: 'LineString';
  coordinates: number[][];
}

export interface RouteFeature {
  type: 'Feature';
  properties: RouteProperties;
  geometry: RouteGeometry;
}

export interface RouteResponse {
  type: 'FeatureCollection';
  features: RouteFeature[];
}

export interface RouteError {
  error: string;
}

/**
 * Service for fetching routing information from backend API.
 * Implements caching to reduce API calls and improve performance.
 * Follows Open/Closed Principle: extensible for new routing features.
 */
export class RoutingApiService {
  private cache: Map<string, RouteResponse> = new Map();
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get route between two points.
   * Returns cached result if available, otherwise fetches from API.
   * Follows Strategy Pattern: can be extended with different routing strategies.
   */
  async getRoute(origin: LatLng, destination: LatLng): Promise<RouteResponse> {
    const cacheKey = this.createCacheKey(origin, destination);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await fetch(`${this.baseUrl}/routes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin,
          destination,
        }),
      });

      if (!response.ok) {
        const errorData: RouteError = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const routeData: RouteResponse = await response.json();
      
      // Cache successful response
      this.cache.set(cacheKey, routeData);
      
      return routeData;

    } catch (error) {
      console.error('Error fetching route:', error);
      // Return fallback route (straight line)
      return this.createFallbackRoute(origin, destination);
    }
  }

  /**
   * Clear the route cache (useful for testing).
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Create cache key from coordinates.
   * Follows Value Object pattern: immutable key generation.
   */
  private createCacheKey(origin: LatLng, destination: LatLng): string {
    return `${origin.lat.toFixed(6)},${origin.lng.toFixed(6)}->${destination.lat.toFixed(6)},${destination.lng.toFixed(6)}`;
  }

  /**
   * Create a simple straight-line fallback route when API fails.
   * Follows Fallback Strategy pattern.
   */
  private createFallbackRoute(origin: LatLng, destination: LatLng): RouteResponse {
    const distance = this.calculateHaversineDistance(origin, destination);
    const duration = distance / 13.89; // Assume 50 km/h = 13.89 m/s average speed

    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            distance,
            duration,
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [origin.lat, origin.lng],
              [destination.lat, destination.lng],
            ],
          },
        },
      ],
    };
  }

  /**
   * Calculate distance between two points using Haversine formula.
   * Returns distance in meters.
   */
  private calculateHaversineDistance(origin: LatLng, destination: LatLng): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRadians(destination.lat - origin.lat);
    const dLng = this.toRadians(destination.lng - origin.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(origin.lat)) * Math.cos(this.toRadians(destination.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians.
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Singleton instance for the application
export const routingApiService = new RoutingApiService();
