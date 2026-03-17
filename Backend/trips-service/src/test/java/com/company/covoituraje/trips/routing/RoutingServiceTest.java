package com.company.covoituraje.trips.routing;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for RoutingService.
 * Tests routing logic, caching, and fallback behavior.
 * Follows TDD: test first, then implement.
 */
class RoutingServiceTest {

    private RoutingService routingService;

    @BeforeEach
    void setUp() {
        routingService = new RoutingService();
    }

    @Test
    void shouldReturnRouteForValidCoordinates() {
        // Given
        double originLat = 41.3851;
        double originLng = 2.1734;
        double destLat = 41.4036;
        double destLng = 2.1744;

        // When
        RoutingService.RouteResponse response = routingService.getRoute(originLat, originLng, destLat, destLng);

        // Then
        assertNotNull(response);
        assertNotNull(response.coordinates);
        assertFalse(response.coordinates.isEmpty());
        assertTrue(response.distance > 0);
        assertTrue(response.duration > 0);
        
        // Should have at least origin and destination
        assertTrue(response.coordinates.size() >= 2);
        
        // First coordinate should be origin
        double[] firstCoord = response.coordinates.get(0);
        assertEquals(originLat, firstCoord[0], 0.0001);
        assertEquals(originLng, firstCoord[1], 0.0001);
        
        // Last coordinate should be destination
        double[] lastCoord = response.coordinates.get(response.coordinates.size() - 1);
        assertEquals(destLat, lastCoord[0], 0.0001);
        assertEquals(destLng, lastCoord[1], 0.0001);
    }

    @Test
    void shouldCacheRouteResults() {
        // Given
        double originLat = 41.3851;
        double originLng = 2.1734;
        double destLat = 41.4036;
        double destLng = 2.1744;

        // When - first call
        RoutingService.RouteResponse response1 = routingService.getRoute(originLat, originLng, destLat, destLng);
        
        // When - second call (should be cached)
        RoutingService.RouteResponse response2 = routingService.getRoute(originLat, originLng, destLat, destLng);

        // Then - should be the same object (cached)
        assertSame(response1, response2);
    }

    @Test
    void shouldClearCache() {
        // Given
        double originLat = 41.3851;
        double originLng = 2.1734;
        double destLat = 41.4036;
        double destLng = 2.1744;

        // When - first call
        RoutingService.RouteResponse response1 = routingService.getRoute(originLat, originLng, destLat, destLng);
        
        // Clear cache
        routingService.clearCache();
        
        // When - second call after cache clear
        RoutingService.RouteResponse response2 = routingService.getRoute(originLat, originLng, destLat, destLng);

        // Then - should be different objects (not cached)
        assertNotSame(response1, response2);
    }

    @Test
    void shouldHandleSameOriginAndDestination() {
        // Given
        double lat = 41.3851;
        double lng = 2.1734;

        // When
        RoutingService.RouteResponse response = routingService.getRoute(lat, lng, lat, lng);

        // Then
        assertNotNull(response);
        assertNotNull(response.coordinates);
        assertEquals(2, response.coordinates.size()); // Origin and destination
        assertEquals(0.0, response.distance, 0.1); // Should be very small distance
        assertEquals(0.0, response.duration, 0.1); // Should be very small duration
    }

    @Test
    void shouldReturnFallbackRouteWhenApiFails() {
        // Given - coordinates that might cause API issues (middle of ocean)
        double originLat = 0.0;
        double originLng = 0.0;
        double destLat = 1.0;
        double destLng = 1.0;

        // When
        RoutingService.RouteResponse response = routingService.getRoute(originLat, originLng, destLat, destLng);

        // Then - should still return a valid response (fallback)
        assertNotNull(response);
        assertNotNull(response.coordinates);
        assertFalse(response.coordinates.isEmpty());
        assertTrue(response.distance > 0);
        assertTrue(response.duration > 0);
        
        // Should have origin and destination
        assertEquals(2, response.coordinates.size());
    }
}
