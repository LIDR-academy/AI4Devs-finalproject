package com.company.covoituraje.notification.service;

import com.company.covoituraje.notification.service.NotificationEvents.BookingConfirmedEvent;
import com.company.covoituraje.notification.service.NotificationEvents.NotificationEvent;
import com.company.covoituraje.notification.service.NotificationEvents.TripCancelledEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * TDD for EmailWorker: consumes domain events and delegates to NotificationService.
 * Follows SOLID via depending on the NotificationService abstraction for side-effects.
 */
class EmailWorkerTest {

    private NotificationService notificationService;
    private EmailWorker worker;

    @BeforeEach
    void setUp() {
        notificationService = Mockito.mock(NotificationService.class);
        worker = new EmailWorker(notificationService);
    }

    @Test
    void handlesBookingConfirmedEvent_andDelegatesToNotificationService() {
        BookingConfirmedEvent event = new BookingConfirmedEvent(
                "user-1",
                "user@example.com",
                "trip-123",
                2,
                Locale.ENGLISH
        );

        worker.handle(event);

        verify(notificationService, times(1))
                .sendBookingConfirmation("user-1", "user@example.com", "trip-123", 2, Locale.ENGLISH);
    }

    @Test
    void handlesTripCancelledEvent_andDelegatesToNotificationService() {
        TripCancelledEvent event = new TripCancelledEvent(
                "user-9",
                "driver@example.com",
                "trip-XYZ",
                Locale.forLanguageTag("es")
        );

        worker.handle(event);

        ArgumentCaptor<String> userCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> emailCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> tripCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Locale> localeCaptor = ArgumentCaptor.forClass(Locale.class);

        verify(notificationService, times(1))
                .sendTripCancellation(userCaptor.capture(), emailCaptor.capture(), tripCaptor.capture(), localeCaptor.capture());

        assertThat(userCaptor.getValue()).isEqualTo("user-9");
        assertThat(emailCaptor.getValue()).isEqualTo("driver@example.com");
        assertThat(tripCaptor.getValue()).isEqualTo("trip-XYZ");
        assertThat(localeCaptor.getValue().toLanguageTag()).isEqualTo("es");
    }

    @Test
    void shouldHandleMultipleEventsSequentially() {
        // Given
        BookingConfirmedEvent bookingEvent = new BookingConfirmedEvent(
                "user-1", "user1@example.com", "trip-123", 2, Locale.ENGLISH
        );
        TripCancelledEvent tripEvent = new TripCancelledEvent(
                "user-2", "user2@example.com", "trip-456", Locale.forLanguageTag("es")
        );

        // When
        worker.handle(bookingEvent);
        worker.handle(tripEvent);

        // Then
        verify(notificationService, times(1))
                .sendBookingConfirmation("user-1", "user1@example.com", "trip-123", 2, Locale.ENGLISH);
        verify(notificationService, times(1))
                .sendTripCancellation("user-2", "user2@example.com", "trip-456", Locale.forLanguageTag("es"));
    }

    @Test
    void shouldHandleEventsWithDifferentLocales() {
        // Given
        BookingConfirmedEvent englishEvent = new BookingConfirmedEvent(
                "user-1", "user@example.com", "trip-123", 1, Locale.ENGLISH
        );
        BookingConfirmedEvent spanishEvent = new BookingConfirmedEvent(
                "user-2", "user@example.com", "trip-456", 2, Locale.forLanguageTag("es")
        );
        BookingConfirmedEvent catalanEvent = new BookingConfirmedEvent(
                "user-3", "user@example.com", "trip-789", 3, Locale.forLanguageTag("ca")
        );

        // When
        worker.handle(englishEvent);
        worker.handle(spanishEvent);
        worker.handle(catalanEvent);

        // Then
        verify(notificationService, times(1))
                .sendBookingConfirmation("user-1", "user@example.com", "trip-123", 1, Locale.ENGLISH);
        verify(notificationService, times(1))
                .sendBookingConfirmation("user-2", "user@example.com", "trip-456", 2, Locale.forLanguageTag("es"));
        verify(notificationService, times(1))
                .sendBookingConfirmation("user-3", "user@example.com", "trip-789", 3, Locale.forLanguageTag("ca"));
    }

    @Test
    void shouldHandleEventsWithZeroSeats() {
        // Given
        BookingConfirmedEvent event = new BookingConfirmedEvent(
                "user-1", "user@example.com", "trip-123", 0, Locale.ENGLISH
        );

        // When
        worker.handle(event);

        // Then
        verify(notificationService, times(1))
                .sendBookingConfirmation("user-1", "user@example.com", "trip-123", 0, Locale.ENGLISH);
    }

    @Test
    void shouldHandleEventsWithLargeSeatCounts() {
        // Given
        BookingConfirmedEvent event = new BookingConfirmedEvent(
                "user-1", "user@example.com", "trip-123", 8, Locale.ENGLISH
        );

        // When
        worker.handle(event);

        // Then
        verify(notificationService, times(1))
                .sendBookingConfirmation("user-1", "user@example.com", "trip-123", 8, Locale.ENGLISH);
    }

    @Test
    void shouldNotCallNotificationServiceForUnknownEventTypes() {
        // Given
        NotificationEvent unknownEvent = new NotificationEvent() {};

        // When
        worker.handle(unknownEvent);

        // Then
        verify(notificationService, never()).sendBookingConfirmation(any(), any(), any(), anyInt(), any());
        verify(notificationService, never()).sendTripCancellation(any(), any(), any(), any());
    }
}


