package com.company.covoituraje.booking.integration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * TDD for NotificationEventPublisher: publishes domain events to notification-service.
 * Follows SOLID: depends on abstraction (NotificationServiceClient), not concrete HTTP calls.
 */
class NotificationEventPublisherTest {

    private NotificationServiceClient notificationClient;
    private NotificationEventPublisher publisher;

    @BeforeEach
    void setUp() {
        notificationClient = Mockito.mock(NotificationServiceClient.class);
        publisher = new NotificationEventPublisher(notificationClient);
    }

    @Test
    void publishBookingConfirmedEvent_callsNotificationServiceEndpoint() throws Exception {
        // Given
        String userId = "user-123";
        String email = "user@example.com";
        String tripId = "trip-456";
        int seats = 2;
        Locale locale = Locale.ENGLISH;

        // When
        publisher.publishBookingConfirmed(userId, email, tripId, seats, locale);

        // Then
        ArgumentCaptor<NotificationServiceClient.BookingConfirmedRequest> captor = 
            ArgumentCaptor.forClass(NotificationServiceClient.BookingConfirmedRequest.class);
        verify(notificationClient, times(1)).bookingConfirmed(captor.capture());
        
        NotificationServiceClient.BookingConfirmedRequest request = captor.getValue();
        assertThat(request.userId).isEqualTo("user-123");
        assertThat(request.email).isEqualTo("user@example.com");
        assertThat(request.tripId).isEqualTo("trip-456");
        assertThat(request.seats).isEqualTo(2);
        assertThat(request.locale).isEqualTo("en");
    }

    @Test
    void publishTripCancelledEvent_callsNotificationServiceEndpoint() throws Exception {
        // Given
        String userId = "driver-789";
        String email = "driver@example.com";
        String tripId = "trip-999";
        Locale locale = Locale.forLanguageTag("es");

        // When
        publisher.publishTripCancelled(userId, email, tripId, locale);

        // Then
        ArgumentCaptor<NotificationServiceClient.TripCancelledRequest> captor = 
            ArgumentCaptor.forClass(NotificationServiceClient.TripCancelledRequest.class);
        verify(notificationClient, times(1)).tripCancelled(captor.capture());
        
        NotificationServiceClient.TripCancelledRequest request = captor.getValue();
        assertThat(request.userId).isEqualTo("driver-789");
        assertThat(request.email).isEqualTo("driver@example.com");
        assertThat(request.tripId).isEqualTo("trip-999");
        assertThat(request.locale).isEqualTo("es");
    }

    @Test
    void handlesNotificationServiceErrors_gracefully() throws Exception {
        // Given
        doThrow(new RuntimeException("Network error")).when(notificationClient).bookingConfirmed(any());

        // When/Then - should not throw exception
        publisher.publishBookingConfirmed("user-1", "user@example.com", "trip-1", 1, Locale.ENGLISH);
        
        // Verify the call was attempted
        verify(notificationClient, times(1)).bookingConfirmed(any());
    }
}
