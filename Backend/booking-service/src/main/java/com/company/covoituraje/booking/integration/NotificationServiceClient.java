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

    public static class SendRequest {
        public String title;
        public String body;
        public SendRequest() {}
        public SendRequest(String title, String body) {
            this.title = title;
            this.body = body;
        }
    }
}


