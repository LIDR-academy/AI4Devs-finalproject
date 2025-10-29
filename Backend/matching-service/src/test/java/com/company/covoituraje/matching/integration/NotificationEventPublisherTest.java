package com.company.covoituraje.matching.integration;

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
    void publishMatchFoundEvent_callsNotificationServiceEndpoint() throws Exception {
        // Given
        String userId = "user-123";
        String email = "user@example.com";
        String tripId = "trip-456";
        String driverId = "driver-789";
        double score = 0.85;
        Locale locale = Locale.ENGLISH;

        // When
        publisher.publishMatchFound(userId, email, tripId, driverId, score, locale);

        // Then
        ArgumentCaptor<NotificationServiceClient.MatchFoundRequest> captor = 
            ArgumentCaptor.forClass(NotificationServiceClient.MatchFoundRequest.class);
        verify(notificationClient, times(1)).matchFound(captor.capture());
        
        NotificationServiceClient.MatchFoundRequest request = captor.getValue();
        assertThat(request.userId).isEqualTo("user-123");
        assertThat(request.email).isEqualTo("user@example.com");
        assertThat(request.tripId).isEqualTo("trip-456");
        assertThat(request.driverId).isEqualTo("driver-789");
        assertThat(request.score).isEqualTo(0.85);
        assertThat(request.locale).isEqualTo("en");
    }

    @Test
    void publishMatchExpiredEvent_callsNotificationServiceEndpoint() throws Exception {
        // Given
        String userId = "user-456";
        String email = "user@example.com";
        String tripId = "trip-999";
        Locale locale = Locale.forLanguageTag("es");

        // When
        publisher.publishMatchExpired(userId, email, tripId, locale);

        // Then
        ArgumentCaptor<NotificationServiceClient.MatchExpiredRequest> captor = 
            ArgumentCaptor.forClass(NotificationServiceClient.MatchExpiredRequest.class);
        verify(notificationClient, times(1)).matchExpired(captor.capture());
        
        NotificationServiceClient.MatchExpiredRequest request = captor.getValue();
        assertThat(request.userId).isEqualTo("user-456");
        assertThat(request.email).isEqualTo("user@example.com");
        assertThat(request.tripId).isEqualTo("trip-999");
        assertThat(request.locale).isEqualTo("es");
    }

    @Test
    void handlesNotificationServiceErrors_gracefully() throws Exception {
        // Given
        doThrow(new RuntimeException("Network error")).when(notificationClient).matchFound(any());

        // When/Then - should not throw exception
        publisher.publishMatchFound("user-1", "user@example.com", "trip-1", "driver-1", 0.8, Locale.ENGLISH);
        
        // Verify the call was attempted
        verify(notificationClient, times(1)).matchFound(any());
    }
}
