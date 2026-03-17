package com.company.covoituraje.trips.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Duration;
import java.util.List;

public class BookingServiceClient {
    
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String bookingServiceUrl;
    
    public BookingServiceClient() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
        this.bookingServiceUrl = System.getProperty("BOOKING_SERVICE_URL", "http://localhost:8083");
    }
    
    public BookingServiceClient(String bookingServiceUrl) {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
        this.bookingServiceUrl = bookingServiceUrl;
    }
    
    /**
     * Checks if a trip has confirmed bookings
     * @param tripId The trip ID to check
     * @return true if the trip has confirmed bookings, false otherwise
     */
    public boolean hasConfirmedBookings(String tripId) {
        try {
            String url = bookingServiceUrl + "/api/bookings?tripId=" + tripId + "&status=CONFIRMED";
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();
            
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                JsonNode bookings = objectMapper.readTree(response.body());
                if (bookings.isArray()) {
                    return bookings.size() > 0;
                }
            }
            
            return false;
            
        } catch (Exception e) {
            // Log the error but don't throw - we want to be resilient
            System.err.println("Error checking bookings for trip " + tripId + ": " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Gets the count of confirmed bookings for a trip
     * @param tripId The trip ID to check
     * @return The number of confirmed bookings
     */
    public int getConfirmedBookingsCount(String tripId) {
        try {
            String url = bookingServiceUrl + "/api/bookings?tripId=" + tripId + "&status=CONFIRMED";
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();
            
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                JsonNode bookings = objectMapper.readTree(response.body());
                if (bookings.isArray()) {
                    return bookings.size();
                }
            }
            
            return 0;
            
        } catch (Exception e) {
            System.err.println("Error getting booking count for trip " + tripId + ": " + e.getMessage());
            return 0;
        }
    }
    
    /**
     * Gets all booking statuses for a trip
     * @param tripId The trip ID to check
     * @return List of booking statuses
     */
    public List<String> getBookingStatuses(String tripId) {
        try {
            String url = bookingServiceUrl + "/api/bookings?tripId=" + tripId;
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();
            
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                JsonNode bookings = objectMapper.readTree(response.body());
                if (bookings.isArray()) {
                    return bookings.findValuesAsText("status");
                }
            }
            
            return List.of();
            
        } catch (Exception e) {
            System.err.println("Error getting booking statuses for trip " + tripId + ": " + e.getMessage());
            return List.of();
        }
    }
}
