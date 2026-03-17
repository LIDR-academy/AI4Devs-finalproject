package com.company.covoituraje.booking.service;

import com.company.covoituraje.booking.integration.TripsServiceClient;
import com.company.covoituraje.booking.integration.UsersServiceClient;
import com.company.covoituraje.http.ServiceIntegrationException;

import java.util.UUID;

/**
 * Servicio para validaciones cross-service en booking
 */
public class BookingValidationService {
    
    private final TripsServiceClient tripsServiceClient;
    private final UsersServiceClient usersServiceClient;
    
    public BookingValidationService(TripsServiceClient tripsServiceClient, UsersServiceClient usersServiceClient) {
        this.tripsServiceClient = tripsServiceClient;
        this.usersServiceClient = usersServiceClient;
    }
    
    /**
     * Valida que un trip existe y tiene asientos disponibles
     */
    public void validateTripAvailability(String tripId, int seatsRequested) throws BookingValidationException {
        try {
            // Validate trip ID format
            UUID.fromString(tripId);
            
            // Check if trip exists and has enough seats
            if (!tripsServiceClient.hasAvailableSeats(tripId, seatsRequested)) {
                throw new BookingValidationException("Trip not found or insufficient seats available");
            }
        } catch (IllegalArgumentException e) {
            throw new BookingValidationException("Invalid trip ID format");
        } catch (ServiceIntegrationException e) {
            throw new BookingValidationException("Error validating trip availability: " + e.getMessage());
        }
    }
    
    /**
     * Valida que un usuario existe
     */
    public void validateUserExists(String userId) throws BookingValidationException {
        try {
            if (!usersServiceClient.userExists(userId)) {
                throw new BookingValidationException("User not found");
            }
        } catch (BookingValidationException e) {
            // Re-throw our own validation exceptions
            throw e;
        } catch (Exception e) {
            throw new BookingValidationException("Error checking if user exists: " + e.getMessage());
        }
    }
    
    /**
     * Valida que el usuario no es el conductor del trip
     */
    public void validateUserIsNotDriver(String tripId, String userId) throws BookingValidationException {
        try {
            // This would need to be implemented in trips-service to return driver info
            // For now, we'll skip this validation
            // TODO: Implement driver validation when trips-service provides driver info endpoint
        } catch (Exception e) {
            throw new BookingValidationException("Error validating user is not driver: " + e.getMessage());
        }
    }
    
    /**
     * Verifica si los servicios externos están disponibles
     */
    public boolean areExternalServicesAvailable() {
        return tripsServiceClient.isServiceAvailable() && usersServiceClient.isServiceAvailable();
    }
}
