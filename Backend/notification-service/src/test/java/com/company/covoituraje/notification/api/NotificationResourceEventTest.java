package com.company.covoituraje.notification.api;

import com.company.covoituraje.notification.service.EmailWorker;
import com.company.covoituraje.notification.service.NotificationEvents;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * TDD for event endpoints that trigger the EmailWorker.
 */
class NotificationResourceEventTest {

    private EmailWorker emailWorker;
    private NotificationResource resource;

    @BeforeEach
    void setUp() {
        emailWorker = Mockito.mock(EmailWorker.class);
        resource = new NotificationResource();
        // inject via reflection (since resource uses @Inject normally)
        setField(resource, "emailWorker", emailWorker);
        // Simulate authenticated user
        setStaticUser("user-abc");
    }

    @Test
    void bookingConfirmedEndpoint_callsWorkerWithEvent() {
        NotificationResource.BookingConfirmedRequest req = new NotificationResource.BookingConfirmedRequest();
        req.email = "emp@example.com";
        req.tripId = "trip-77";
        req.seats = 3;
        req.locale = "en";

        Response response = resource.bookingConfirmed(null, req);

        assertThat(response.getStatus()).isEqualTo(200);
        ArgumentCaptor<NotificationEvents.BookingConfirmedEvent> captor = ArgumentCaptor.forClass(NotificationEvents.BookingConfirmedEvent.class);
        verify(emailWorker, times(1)).handle(captor.capture());
        NotificationEvents.BookingConfirmedEvent event = captor.getValue();
        assertThat(event.userId).isEqualTo("user-abc");
        assertThat(event.email).isEqualTo("emp@example.com");
        assertThat(event.tripId).isEqualTo("trip-77");
        assertThat(event.seats).isEqualTo(3);
        assertThat(event.locale).isEqualTo(Locale.ENGLISH);
    }

    @Test
    void tripCancelledEndpoint_callsWorkerWithEvent() {
        NotificationResource.TripCancelledRequest req = new NotificationResource.TripCancelledRequest();
        req.email = "emp@example.com";
        req.tripId = "trip-88";
        req.locale = "es";

        Response response = resource.tripCancelled(null, req);
        assertThat(response.getStatus()).isEqualTo(200);
        ArgumentCaptor<NotificationEvents.TripCancelledEvent> captor = ArgumentCaptor.forClass(NotificationEvents.TripCancelledEvent.class);
        verify(emailWorker, times(1)).handle(captor.capture());
        NotificationEvents.TripCancelledEvent event = captor.getValue();
        assertThat(event.userId).isEqualTo("user-abc");
        assertThat(event.tripId).isEqualTo("trip-88");
        assertThat(event.locale.toLanguageTag()).isEqualTo("es");
    }

    // --- helpers ---
    private static void setField(Object target, String fieldName, Object value) {
        try {
            java.lang.reflect.Field f = NotificationResource.class.getDeclaredField(fieldName);
            f.setAccessible(true);
            f.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static void setStaticUser(String userId) {
        try {
            java.lang.Class<?> inner = Class.forName("com.company.covoituraje.notification.api.NotificationResource$AuthContext");
            java.lang.reflect.Method m = inner.getDeclaredMethod("setUserId", String.class);
            m.setAccessible(true);
            m.invoke(null, userId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}


