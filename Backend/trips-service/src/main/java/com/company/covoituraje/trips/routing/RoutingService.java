package com.company.covoituraje.trips.routing;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;

import java.io.StringReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for fetching routing information from external routing APIs.
 * Implements caching to reduce API calls and improve performance.
 * Follows Single Responsibility Principle: only handles routing logic.
 * Follows Dependency Inversion Principle: depends on abstractions (HTTP client).
 */
@ApplicationScoped
public class RoutingService {

    private final HttpClient httpClient;
    private final String apiBaseUrl;
    private final String apiKey;
    private final Map<String, RouteResponse> cache;
    private final boolean useOSRM; // true = OSRM (free, no key), false = OpenRouteService

    public RoutingService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        
        // Check which routing service to use
        this.apiKey = System.getenv().getOrDefault("ROUTING_API_KEY", "");
        this.apiBaseUrl = System.getenv().getOrDefault("ROUTING_API_BASE_URL", "");
        
        // If no API key, use OSRM (free public service)
        this.useOSRM = apiKey.isEmpty();
        
        this.cache = new ConcurrentHashMap<>();
    }

    /**
     * Get route between two points.
     * Returns cached result if available, otherwise fetches from API.
     * Follows Open/Closed Principle: extensible for new routing providers.
     */
    public RouteResponse getRoute(double originLat, double originLng, double destLat, double destLng) {
        String cacheKey = String.format("%.6f,%.6f->%.6f,%.6f", originLat, originLng, destLat, destLng);
        
        // Check cache first
        if (cache.containsKey(cacheKey)) {
            return cache.get(cacheKey);
        }
        
        try {
            RouteResponse response = useOSRM 
                ? fetchRouteFromOSRM(originLat, originLng, destLat, destLng)
                : fetchRouteFromOpenRouteService(originLat, originLng, destLat, destLng);
            
            // Cache successful response
            if (response != null && response.coordinates != null && !response.coordinates.isEmpty()) {
                cache.put(cacheKey, response);
                return response;
            } else {
                // API returned null/empty, create fallback and cache it
                RouteResponse fallback = createFallbackRoute(originLat, originLng, destLat, destLng);
                cache.put(cacheKey, fallback);
                return fallback;
            }
            
        } catch (Exception e) {
            System.err.println("Error fetching route: " + e.getMessage());
            // Create fallback and cache it
            RouteResponse fallback = createFallbackRoute(originLat, originLng, destLat, destLng);
            cache.put(cacheKey, fallback);
            return fallback;
        }
    }

    /**
     * Fetch route from OSRM public API (free, no authentication required).
     * API: http://router.project-osrm.org/route/v1/driving/{lon},{lat};{lon},{lat}?overview=full&geometries=geojson
     */
    private RouteResponse fetchRouteFromOSRM(double originLat, double originLng, double destLat, double destLng) throws Exception {
        // OSRM uses lon,lat order (not lat,lon)
        String url = String.format("https://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=full&geometries=geojson",
                originLng, originLat, destLng, destLat);
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();
        
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() != 200) {
            throw new RuntimeException("OSRM API returned status: " + response.statusCode());
        }
        
        return parseOSRMResponse(response.body());
    }

    /**
     * Fetch route from OpenRouteService API (requires API key).
     * API: https://api.openrouteservice.org/v2/directions/driving-car?start={lon},{lat}&end={lon},{lat}
     */
    private RouteResponse fetchRouteFromOpenRouteService(double originLat, double originLng, double destLat, double destLng) throws Exception {
        if (apiBaseUrl.isEmpty() || apiKey.isEmpty()) {
            throw new IllegalStateException("OpenRouteService requires ROUTING_API_BASE_URL and ROUTING_API_KEY");
        }
        
        // OpenRouteService uses lon,lat order
        String url = String.format("%s/v2/directions/driving-car?start=%f,%f&end=%f,%f",
                apiBaseUrl, originLng, originLat, destLng, destLat);
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .header("Authorization", apiKey)
                .GET()
                .build();
        
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() != 200) {
            throw new RuntimeException("OpenRouteService API returned status: " + response.statusCode());
        }
        
        return parseOpenRouteServiceResponse(response.body());
    }

    /**
     * Parse OSRM JSON response to extract coordinates.
     */
    private RouteResponse parseOSRMResponse(String jsonBody) {
        try (JsonReader reader = Json.createReader(new StringReader(jsonBody))) {
            JsonObject root = reader.readObject();
            
            if (!"Ok".equals(root.getString("code", ""))) {
                return null;
            }
            
            JsonArray routes = root.getJsonArray("routes");
            if (routes == null || routes.isEmpty()) {
                return null;
            }
            
            JsonObject route = routes.getJsonObject(0);
            JsonObject geometry = route.getJsonObject("geometry");
            JsonArray coordinates = geometry.getJsonArray("coordinates");
            
            List<double[]> coords = new ArrayList<>();
            for (int i = 0; i < coordinates.size(); i++) {
                JsonArray coord = coordinates.getJsonArray(i);
                // OSRM returns [lon, lat], we need [lat, lon]
                coords.add(new double[]{coord.getJsonNumber(1).doubleValue(), coord.getJsonNumber(0).doubleValue()});
            }
            
            double distance = route.getJsonNumber("distance").doubleValue();
            double duration = route.getJsonNumber("duration").doubleValue();
            
            return new RouteResponse(coords, distance, duration);
            
        } catch (Exception e) {
            System.err.println("Error parsing OSRM response: " + e.getMessage());
            return null;
        }
    }

    /**
     * Parse OpenRouteService JSON response to extract coordinates.
     */
    private RouteResponse parseOpenRouteServiceResponse(String jsonBody) {
        try (JsonReader reader = Json.createReader(new StringReader(jsonBody))) {
            JsonObject root = reader.readObject();
            JsonArray features = root.getJsonArray("features");
            
            if (features == null || features.isEmpty()) {
                return null;
            }
            
            JsonObject feature = features.getJsonObject(0);
            JsonObject geometry = feature.getJsonObject("geometry");
            JsonArray coordinates = geometry.getJsonArray("coordinates");
            
            List<double[]> coords = new ArrayList<>();
            for (int i = 0; i < coordinates.size(); i++) {
                JsonArray coord = coordinates.getJsonArray(i);
                // OpenRouteService returns [lon, lat], we need [lat, lon]
                coords.add(new double[]{coord.getJsonNumber(1).doubleValue(), coord.getJsonNumber(0).doubleValue()});
            }
            
            JsonObject properties = feature.getJsonObject("properties");
            JsonObject summary = properties.getJsonObject("summary");
            double distance = summary.getJsonNumber("distance").doubleValue();
            double duration = summary.getJsonNumber("duration").doubleValue();
            
            return new RouteResponse(coords, distance, duration);
            
        } catch (Exception e) {
            System.err.println("Error parsing OpenRouteService response: " + e.getMessage());
            return null;
        }
    }

    /**
     * Create a simple straight-line fallback route when API fails.
     */
    private RouteResponse createFallbackRoute(double originLat, double originLng, double destLat, double destLng) {
        List<double[]> coords = new ArrayList<>();
        coords.add(new double[]{originLat, originLng});
        coords.add(new double[]{destLat, destLng});
        
        // Calculate approximate distance using Haversine formula
        double distance = calculateHaversineDistance(originLat, originLng, destLat, destLng);
        double duration = distance / 50.0 * 3600.0; // Assume 50 km/h average speed
        
        return new RouteResponse(coords, distance, duration);
    }

    /**
     * Calculate distance between two points using Haversine formula.
     * Returns distance in meters.
     */
    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371000; // Earth radius in meters
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Clear the route cache (useful for testing).
     */
    public void clearCache() {
        cache.clear();
    }

    /**
     * Response object containing route information.
     * Follows Value Object pattern: immutable data container.
     */
    public static class RouteResponse {
        public final List<double[]> coordinates; // List of [lat, lng] pairs
        public final double distance; // Distance in meters
        public final double duration; // Duration in seconds

        public RouteResponse(List<double[]> coordinates, double distance, double duration) {
            this.coordinates = coordinates;
            this.distance = distance;
            this.duration = duration;
        }
    }
}
