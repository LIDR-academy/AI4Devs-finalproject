package com.company.covoituraje.booking.service;

import com.company.covoituraje.booking.integration.TripsServiceClient;
import com.company.covoituraje.booking.integration.UsersServiceClient;
import com.company.covoituraje.http.ServiceIntegrationException;
import com.company.covoituraje.shared.dto.TripDto;
import com.company.covoituraje.shared.dto.UserDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Test para verificar las validaciones cross-service en booking
 */
@ExtendWith(MockitoExtension.class)
class BookingValidationServiceTest {
    
    @Mock
    private TripsServiceClient tripsServiceClient;
    
    @Mock
    private UsersServiceClient usersServiceClient;
    
    @Test
    void validateTripAvailability_ShouldPassWhenTripHasEnoughSeats() throws Exception {
        // Arrange
        BookingValidationService service = new BookingValidationService(tripsServiceClient, usersServiceClient);
        String tripId = "550e8400-e29b-41d4-a716-446655440001"; // Valid UUID
        int seatsRequested = 2;
        
        when(tripsServiceClient.hasAvailableSeats(tripId, seatsRequested)).thenReturn(true);
        
        // Act & Assert - should not throw exception
        assertDoesNotThrow(() -> service.validateTripAvailability(tripId, seatsRequested));
        
        verify(tripsServiceClient).hasAvailableSeats(tripId, seatsRequested);
    }
    
    @Test
    void validateTripAvailability_ShouldFailWhenTripHasInsufficientSeats() throws Exception {
        // Arrange
        BookingValidationService service = new BookingValidationService(tripsServiceClient, usersServiceClient);
        String tripId = "550e8400-e29b-41d4-a716-446655440001"; // Valid UUID
        int seatsRequested = 3;
        
        when(tripsServiceClient.hasAvailableSeats(tripId, seatsRequested)).thenReturn(false);
        
        // Act & Assert
        BookingValidationException exception = assertThrows(
            BookingValidationException.class,
            () -> service.validateTripAvailability(tripId, seatsRequested)
        );
        
        assertEquals("Trip not found or insufficient seats available", exception.getMessage());
        verify(tripsServiceClient).hasAvailableSeats(tripId, seatsRequested);
    }
    
    @Test
    void validateTripAvailability_ShouldFailWhenServiceException() throws Exception {
        // Arrange
        BookingValidationService service = new BookingValidationService(tripsServiceClient, usersServiceClient);
        String tripId = "550e8400-e29b-41d4-a716-446655440001"; // Valid UUID
        int seatsRequested = 2;
        
        when(tripsServiceClient.hasAvailableSeats(tripId, seatsRequested))
            .thenThrow(new ServiceIntegrationException("Service unavailable"));
        
        // Act & Assert
        BookingValidationException exception = assertThrows(
            BookingValidationException.class,
            () -> service.validateTripAvailability(tripId, seatsRequested)
        );
        
        assertTrue(exception.getMessage().contains("Error validating trip availability"));
        assertTrue(exception.getMessage().contains("Service unavailable"));
    }
    
    @Test
    void validateUserExists_ShouldPassWhenUserExists() {
        // Arrange
        BookingValidationService service = new BookingValidationService(tripsServiceClient, usersServiceClient);
        String userId = "user1";
        
        when(usersServiceClient.userExists(userId)).thenReturn(true);
        
        // Act & Assert - should not throw exception
        assertDoesNotThrow(() -> service.validateUserExists(userId));
        
        verify(usersServiceClient).userExists(userId);
    }
    
    @Test
    void validateUserExists_ShouldFailWhenUserDoesNotExist() {
        // Arrange
        BookingValidationService service = new BookingValidationService(tripsServiceClient, usersServiceClient);
        String userId = "user1";
        
        when(usersServiceClient.userExists(userId)).thenReturn(false);
        
        // Act & Assert
        BookingValidationException exception = assertThrows(
            BookingValidationException.class,
            () -> service.validateUserExists(userId)
        );
        
        assertEquals("User not found", exception.getMessage());
        verify(usersServiceClient).userExists(userId);
    }
    
    @Test
    void validateTripAvailability_ShouldFailForInvalidTripIdFormat() throws Exception {
        // Arrange
        BookingValidationService service = new BookingValidationService(tripsServiceClient, usersServiceClient);
        String invalidTripId = "invalid-uuid";
        int seatsRequested = 2;
        
        // Act & Assert
        BookingValidationException exception = assertThrows(
            BookingValidationException.class,
            () -> service.validateTripAvailability(invalidTripId, seatsRequested)
        );
        
        assertEquals("Invalid trip ID format", exception.getMessage());
        verify(tripsServiceClient, never()).hasAvailableSeats(any(), anyInt());
    }
    
    @Test
    void areExternalServicesAvailable_ShouldReturnTrueWhenAllServicesAvailable() {
        // Arrange
        BookingValidationService service = new BookingValidationService(tripsServiceClient, usersServiceClient);
        
        when(tripsServiceClient.isServiceAvailable()).thenReturn(true);
        when(usersServiceClient.isServiceAvailable()).thenReturn(true);
        
        // Act
        boolean result = service.areExternalServicesAvailable();
        
        // Assert
        assertTrue(result);
        verify(tripsServiceClient).isServiceAvailable();
        verify(usersServiceClient).isServiceAvailable();
    }
    
    @Test
    void areExternalServicesAvailable_ShouldReturnFalseWhenAnyServiceUnavailable() {
        // Arrange
        BookingValidationService service = new BookingValidationService(tripsServiceClient, usersServiceClient);
        
        when(tripsServiceClient.isServiceAvailable()).thenReturn(true);
        when(usersServiceClient.isServiceAvailable()).thenReturn(false);
        
        // Act
        boolean result = service.areExternalServicesAvailable();
        
        // Assert
        assertFalse(result);
        verify(tripsServiceClient).isServiceAvailable();
        verify(usersServiceClient).isServiceAvailable();
    }
}
