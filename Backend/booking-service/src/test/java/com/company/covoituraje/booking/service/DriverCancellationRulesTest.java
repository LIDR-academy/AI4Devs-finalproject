package com.company.covoituraje.booking.service;

import com.company.covoituraje.booking.integration.TripsServiceClient;
import com.company.covoituraje.booking.integration.UsersServiceClient;
import com.company.covoituraje.booking.service.BookingValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * TDD tests for driver cancellation rules:
 * 1. Driver cannot cancel within configurable cutoff time (default 2 hours)
 * 2. Passenger can cancel anytime
 * 3. Cutoff time should be configurable via environment variable
 */
@ExtendWith(MockitoExtension.class)
class DriverCancellationRulesTest {

    @Mock
    private TripsServiceClient tripsServiceClient;
    
    @Mock
    private UsersServiceClient usersServiceClient;

    private DriverCancellationService cancellationService;

    @BeforeEach
    void setUp() {
        // Reset environment variable
        System.clearProperty("DRIVER_CANCEL_CUTOFF_HOURS");
        cancellationService = new DriverCancellationService();
    }

    @Test
    void canDriverCancel_ShouldReturnTrueWhenTripIsFarInFuture() {
        // Arrange
        OffsetDateTime tripDateTime = OffsetDateTime.now().plusHours(5); // 5 hours from now
        String driverId = "driver-001";
        String tripId = "trip-001";

        // Act
        boolean canCancel = cancellationService.canDriverCancel(driverId, tripId, tripDateTime);

        // Assert
        assertTrue(canCancel);
    }

    @Test
    void canDriverCancel_ShouldReturnFalseWhenTripIsWithinCutoffTime() {
        // Arrange
        OffsetDateTime tripDateTime = OffsetDateTime.now().plusMinutes(30); // 30 minutes from now (within 2h cutoff)
        String driverId = "driver-001";
        String tripId = "trip-001";

        // Act
        boolean canCancel = cancellationService.canDriverCancel(driverId, tripId, tripDateTime);

        // Assert
        assertFalse(canCancel);
    }

    @Test
    void canDriverCancel_ShouldUseConfigurableCutoffTime() {
        // Arrange
        System.setProperty("DRIVER_CANCEL_CUTOFF_HOURS", "4"); // 4 hours cutoff
        cancellationService = new DriverCancellationService(); // Recreate to pick up new config
        
        OffsetDateTime tripDateTime = OffsetDateTime.now().plusHours(3); // 3 hours from now (within 4h cutoff)
        String driverId = "driver-001";
        String tripId = "trip-001";

        // Act
        boolean canCancel = cancellationService.canDriverCancel(driverId, tripId, tripDateTime);

        // Assert
        assertFalse(canCancel);
    }

    @Test
    void canDriverCancel_ShouldReturnTrueWhenTripIsBeyondConfigurableCutoff() {
        // Arrange
        System.setProperty("DRIVER_CANCEL_CUTOFF_HOURS", "1"); // 1 hour cutoff
        cancellationService = new DriverCancellationService(); // Recreate to pick up new config
        
        OffsetDateTime tripDateTime = OffsetDateTime.now().plusHours(2); // 2 hours from now (beyond 1h cutoff)
        String driverId = "driver-001";
        String tripId = "trip-001";

        // Act
        boolean canCancel = cancellationService.canDriverCancel(driverId, tripId, tripDateTime);

        // Assert
        assertTrue(canCancel);
    }

    @Test
    void canPassengerCancel_ShouldAlwaysReturnTrue() {
        // Arrange
        OffsetDateTime tripDateTime = OffsetDateTime.now().plusMinutes(30); // 30 minutes from now
        String passengerId = "passenger-001";
        String bookingId = "booking-001";

        // Act
        boolean canCancel = cancellationService.canPassengerCancel(passengerId, bookingId, tripDateTime);

        // Assert
        assertTrue(canCancel);
    }

    @Test
    void canPassengerCancel_ShouldReturnTrueEvenForImminentTrips() {
        // Arrange
        OffsetDateTime tripDateTime = OffsetDateTime.now().plusMinutes(5); // 5 minutes from now
        String passengerId = "passenger-001";
        String bookingId = "booking-001";

        // Act
        boolean canCancel = cancellationService.canPassengerCancel(passengerId, bookingId, tripDateTime);

        // Assert
        assertTrue(canCancel);
    }

    @Test
    void validateDriverCancellation_ShouldThrowExceptionWhenWithinCutoff() {
        // Arrange
        OffsetDateTime tripDateTime = OffsetDateTime.now().plusMinutes(30); // 30 minutes from now
        String driverId = "driver-001";
        String tripId = "trip-001";

        // Act & Assert
        BookingValidationException exception = assertThrows(
            BookingValidationException.class,
            () -> cancellationService.validateDriverCancellation(driverId, tripId, tripDateTime)
        );

        assertTrue(exception.getMessage().contains("Driver cannot cancel"));
        assertTrue(exception.getMessage().contains("hours of departure time"));
    }

    @Test
    void validateDriverCancellation_ShouldNotThrowExceptionWhenBeyondCutoff() {
        // Arrange
        OffsetDateTime tripDateTime = OffsetDateTime.now().plusHours(3); // 3 hours from now
        String driverId = "driver-001";
        String tripId = "trip-001";

        // Act & Assert - should not throw
        assertDoesNotThrow(() -> 
            cancellationService.validateDriverCancellation(driverId, tripId, tripDateTime)
        );
    }

    @Test
    void validatePassengerCancellation_ShouldNeverThrowException() {
        // Arrange
        OffsetDateTime tripDateTime = OffsetDateTime.now().plusMinutes(5); // 5 minutes from now
        String passengerId = "passenger-001";
        String bookingId = "booking-001";

        // Act & Assert - should never throw for passengers
        assertDoesNotThrow(() -> 
            cancellationService.validatePassengerCancellation(passengerId, bookingId, tripDateTime)
        );
    }

    @Test
    void getCutoffHours_ShouldReturnDefaultWhenNotConfigured() {
        // Act
        int cutoffHours = cancellationService.getCutoffHours();

        // Assert
        assertEquals(2, cutoffHours); // Default 2 hours
    }

    @Test
    void getCutoffHours_ShouldReturnConfiguredValue() {
        // Arrange
        System.setProperty("DRIVER_CANCEL_CUTOFF_HOURS", "6");
        cancellationService = new DriverCancellationService();

        // Act
        int cutoffHours = cancellationService.getCutoffHours();

        // Assert
        assertEquals(6, cutoffHours);
    }

    @Test
    void getCutoffHours_ShouldHandleInvalidConfiguration() {
        // Arrange
        System.setProperty("DRIVER_CANCEL_CUTOFF_HOURS", "invalid");
        cancellationService = new DriverCancellationService();

        // Act
        int cutoffHours = cancellationService.getCutoffHours();

        // Assert
        assertEquals(2, cutoffHours); // Should fall back to default
    }

    @Test
    void getCutoffHours_ShouldHandleNegativeConfiguration() {
        // Arrange
        System.setProperty("DRIVER_CANCEL_CUTOFF_HOURS", "-1");
        cancellationService = new DriverCancellationService();

        // Act
        int cutoffHours = cancellationService.getCutoffHours();

        // Assert
        assertEquals(2, cutoffHours); // Should fall back to default
    }
}
