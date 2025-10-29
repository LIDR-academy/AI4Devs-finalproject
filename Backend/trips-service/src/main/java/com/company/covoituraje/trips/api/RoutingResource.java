package com.company.covoituraje.trips.api;

import com.company.covoituraje.trips.routing.RoutingService;
import jakarta.inject.Inject;
import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObjectBuilder;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

/**
 * REST Resource for routing operations.
 * Provides endpoints to calculate routes between coordinates.
 * Follows Single Responsibility Principle: only handles HTTP routing requests.
 */
@Path("/routes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RoutingResource {

    @Inject
    private RoutingService routingService;

    public RoutingResource() {}

    public RoutingResource(RoutingService routingService) {
        this.routingService = routingService;
    }

    /**
     * Calculate route between two points.
     * POST /api/routes
     * 
     * Body: {
     *   "origin": {"lat": 41.3851, "lng": 2.1734},
     *   "destination": {"lat": 41.4036, "lng": 2.1744}
     * }
     * 
     * Returns simple JSON with route data.
     */
    @POST
    public Response getRoute(RouteRequest request) {
        // Validate input
        if (request == null || request.origin == null || request.destination == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Invalid request: origin and destination are required\"}")
                    .build();
        }

        if (!isValidCoordinate(request.origin.lat, request.origin.lng) ||
            !isValidCoordinate(request.destination.lat, request.destination.lng)) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Invalid coordinates: lat must be [-90, 90], lng must be [-180, 180]\"}")
                    .build();
        }

        try {
            RoutingService.RouteResponse route = routingService.getRoute(
                    request.origin.lat,
                    request.origin.lng,
                    request.destination.lat,
                    request.destination.lng
            );

            if (route == null || route.coordinates == null || route.coordinates.isEmpty()) {
                return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                        .entity("{\"error\": \"Unable to calculate route\"}")
                        .build();
            }

            // Build simple JSON response
            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append("\"type\": \"FeatureCollection\",");
            json.append("\"features\": [");
            json.append("{");
            json.append("\"type\": \"Feature\",");
            json.append("\"properties\": {");
            json.append("\"distance\": ").append(route.distance).append(",");
            json.append("\"duration\": ").append(route.duration);
            json.append("},");
            json.append("\"geometry\": {");
            json.append("\"type\": \"LineString\",");
            json.append("\"coordinates\": [");
            
            for (int i = 0; i < route.coordinates.size(); i++) {
                if (i > 0) json.append(",");
                double[] coord = route.coordinates.get(i);
                json.append("[").append(coord[0]).append(",").append(coord[1]).append("]");
            }
            
            json.append("]");
            json.append("}");
            json.append("}");
            json.append("]");
            json.append("}");

            return Response.ok(json.toString()).build();

        } catch (Exception e) {
            System.err.println("Error calculating route: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Internal server error calculating route\"}")
                    .build();
        }
    }

    /**
     * Health check endpoint for routing service.
     * GET /api/routes/health
     */
    @GET
    @Path("/health")
    public Response health() {
        return Response.ok("{\"status\": \"ok\", \"service\": \"routing\"}")
                .build();
    }

    /**
     * Validate coordinate values.
     */
    private boolean isValidCoordinate(double lat, double lng) {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }

    /**
     * Request DTO for route calculation.
     */
    public static class RouteRequest {
        public Coordinate origin;
        public Coordinate destination;

        public RouteRequest() {}

        public RouteRequest(Coordinate origin, Coordinate destination) {
            this.origin = origin;
            this.destination = destination;
        }
    }

    /**
     * Coordinate DTO.
     */
    public static class Coordinate {
        public double lat;
        public double lng;

        public Coordinate() {}

        public Coordinate(double lat, double lng) {
            this.lat = lat;
            this.lng = lng;
        }
    }
}

