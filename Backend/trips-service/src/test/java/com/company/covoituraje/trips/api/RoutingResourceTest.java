package com.company.covoituraje.trips.api;

import com.company.covoituraje.trips.routing.RoutingService;
import jakarta.json.JsonObject;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for RoutingResource.
 * Tests endpoint validation, response formatting, and error handling.
 */
class RoutingResourceTest {

    private RoutingResource routingResource;
    private RoutingService routingService;

    @BeforeEach
    void setUp() {
        routingService = mock(RoutingService.class);
        routingResource = new RoutingResource(routingService);
    }

    @Test
    void shouldReturnRouteForValidCoordinates() {
        // Given
        List<double[]> mockCoords = new ArrayList<>();
        mockCoords.add(new double[]{41.3851, 2.1734});
        mockCoords.add(new double[]{41.3900, 2.1750});
        mockCoords.add(new double[]{41.4036, 2.1744});
        
        RoutingService.RouteResponse mockRoute = new RoutingService.RouteResponse(mockCoords, 5000.0, 600.0);
        when(routingService.getRoute(anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(mockRoute);

        RoutingResource.RouteRequest request = new RoutingResource.RouteRequest(
                new RoutingResource.Coordinate(41.3851, 2.1734),
                new RoutingResource.Coordinate(41.4036, 2.1744)
        );

        // When
        Response response = routingResource.getRoute(request);

        // Then
        assertEquals(200, response.getStatus());
        String jsonString = (String) response.getEntity();
        assertTrue(jsonString.contains("\"type\": \"FeatureCollection\""));
        assertTrue(jsonString.contains("\"distance\": 5000.0"));
        assertTrue(jsonString.contains("\"duration\": 600.0"));
        assertTrue(jsonString.contains("\"type\": \"LineString\""));
    }

    @Test
    void shouldReturnBadRequestForNullOrigin() {
        // Given
        RoutingResource.RouteRequest request = new RoutingResource.RouteRequest(
                null,
                new RoutingResource.Coordinate(41.4036, 2.1744)
        );

        // When
        Response response = routingResource.getRoute(request);

        // Then
        assertEquals(400, response.getStatus());
        String jsonString = (String) response.getEntity();
        assertTrue(jsonString.contains("origin and destination are required"));
    }

    @Test
    void shouldReturnBadRequestForNullDestination() {
        // Given
        RoutingResource.RouteRequest request = new RoutingResource.RouteRequest(
                new RoutingResource.Coordinate(41.3851, 2.1734),
                null
        );

        // When
        Response response = routingResource.getRoute(request);

        // Then
        assertEquals(400, response.getStatus());
        String jsonString = (String) response.getEntity();
        assertTrue(jsonString.contains("origin and destination are required"));
    }

    @Test
    void shouldReturnBadRequestForInvalidLatitude() {
        // Given
        RoutingResource.RouteRequest request = new RoutingResource.RouteRequest(
                new RoutingResource.Coordinate(91.0, 2.1734), // Invalid lat > 90
                new RoutingResource.Coordinate(41.4036, 2.1744)
        );

        // When
        Response response = routingResource.getRoute(request);

        // Then
        assertEquals(400, response.getStatus());
        String jsonString = (String) response.getEntity();
        assertTrue(jsonString.contains("Invalid coordinates"));
    }

    @Test
    void shouldReturnBadRequestForInvalidLongitude() {
        // Given
        RoutingResource.RouteRequest request = new RoutingResource.RouteRequest(
                new RoutingResource.Coordinate(41.3851, 181.0), // Invalid lng > 180
                new RoutingResource.Coordinate(41.4036, 2.1744)
        );

        // When
        Response response = routingResource.getRoute(request);

        // Then
        assertEquals(400, response.getStatus());
        String jsonString = (String) response.getEntity();
        assertTrue(jsonString.contains("Invalid coordinates"));
    }

    @Test
    void shouldReturnServiceUnavailableWhenRoutingServiceReturnsNull() {
        // Given
        when(routingService.getRoute(anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(null);

        RoutingResource.RouteRequest request = new RoutingResource.RouteRequest(
                new RoutingResource.Coordinate(41.3851, 2.1734),
                new RoutingResource.Coordinate(41.4036, 2.1744)
        );

        // When
        Response response = routingResource.getRoute(request);

        // Then
        assertEquals(503, response.getStatus());
        String jsonString = (String) response.getEntity();
        assertTrue(jsonString.contains("Unable to calculate route"));
    }

    @Test
    void shouldReturnServiceUnavailableWhenRoutingServiceReturnsEmptyCoordinates() {
        // Given
        RoutingService.RouteResponse emptyRoute = new RoutingService.RouteResponse(new ArrayList<>(), 0.0, 0.0);
        when(routingService.getRoute(anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(emptyRoute);

        RoutingResource.RouteRequest request = new RoutingResource.RouteRequest(
                new RoutingResource.Coordinate(41.3851, 2.1734),
                new RoutingResource.Coordinate(41.4036, 2.1744)
        );

        // When
        Response response = routingResource.getRoute(request);

        // Then
        assertEquals(503, response.getStatus());
        String jsonString = (String) response.getEntity();
        assertTrue(jsonString.contains("Unable to calculate route"));
    }

    @Test
    void shouldReturnInternalServerErrorWhenRoutingServiceThrowsException() {
        // Given
        when(routingService.getRoute(anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenThrow(new RuntimeException("Routing service error"));

        RoutingResource.RouteRequest request = new RoutingResource.RouteRequest(
                new RoutingResource.Coordinate(41.3851, 2.1734),
                new RoutingResource.Coordinate(41.4036, 2.1744)
        );

        // When
        Response response = routingResource.getRoute(request);

        // Then
        assertEquals(500, response.getStatus());
        String jsonString = (String) response.getEntity();
        assertTrue(jsonString.contains("Internal server error"));
    }

    @Test
    void shouldReturnOkForHealthCheck() {
        // When
        Response response = routingResource.health();

        // Then
        assertEquals(200, response.getStatus());
        String jsonString = (String) response.getEntity();
        assertTrue(jsonString.contains("\"status\": \"ok\""));
        assertTrue(jsonString.contains("\"service\": \"routing\""));
    }
}

