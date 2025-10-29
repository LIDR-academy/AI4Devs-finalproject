package com.company.covoituraje.booking.integration;

import com.company.covoituraje.http.ServiceHttpClient;
import com.company.covoituraje.http.ServiceIntegrationException;

public class NotificationServiceClient {

    private final ServiceHttpClient httpClient;

    public NotificationServiceClient(String baseUrl) {
        this.httpClient = new ServiceHttpClient(baseUrl);
    }

    public NotificationServiceClient(ServiceHttpClient httpClient) {
        this.httpClient = httpClient;
    }

    public void sendBookingConfirmed(String userId, String tripId, int seatsRequested) throws ServiceIntegrationException {
        String title = "Reserva confirmada";
        String body = "Tu reserva de " + seatsRequested + " asiento(s) ha sido confirmada";
        httpClient.post("/notifications/send", new SendRequest(title, body), String.class);
    }

    public void sendBookingCancelled(String userId, String tripId) throws ServiceIntegrationException {
        String title = "Viaje cancelado";
        String body = "El viaje " + tripId + " ha sido cancelado";
        httpClient.post("/notifications/send", new SendRequest(title, body), String.class);
    }

    /**
     * Publishes booking confirmed event to notification-service.
     * Follows Open/Closed Principle: extends functionality without modifying existing code.
     */
    public void bookingConfirmed(BookingConfirmedRequest request) throws ServiceIntegrationException {
        httpClient.post("/notifications/events/booking-confirmed", request, String.class);
    }

    /**
     * Publishes trip cancelled event to notification-service.
     * Follows Open/Closed Principle: extends functionality without modifying existing code.
     */
    public void tripCancelled(TripCancelledRequest request) throws ServiceIntegrationException {
        httpClient.post("/notifications/events/trip-cancelled", request, String.class);
    }

    public static class SendRequest {
        public String title;
        public String body;
        public SendRequest() {}
        public SendRequest(String title, String body) {
            this.title = title;
            this.body = body;
        }
    }

    public static class BookingConfirmedRequest {
        public String userId;
        public String email;
        public String tripId;
        public int seats;
        public String locale;
    }

    public static class TripCancelledRequest {
        public String userId;
        public String email;
        public String tripId;
        public String locale;
    }
}


