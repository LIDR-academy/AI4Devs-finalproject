package com.company.covoituraje.matching.integration;

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

    public void sendMatchAccepted(String passengerId, String driverId, String tripId) throws ServiceIntegrationException {
        String title = "Match aceptado";
        String body = "Se ha aceptado el match para el viaje " + tripId;
        httpClient.post("/notifications/send", new SendRequest(title, body), String.class);
    }

    public void sendMatchRejected(String passengerId, String tripId) throws ServiceIntegrationException {
        String title = "Match rechazado";
        String body = "Se ha rechazado el match para el viaje " + tripId;
        httpClient.post("/notifications/send", new SendRequest(title, body), String.class);
    }

    /**
     * Publishes match found event to notification-service.
     * Follows Open/Closed Principle: extends functionality without modifying existing code.
     */
    public void matchFound(MatchFoundRequest request) throws ServiceIntegrationException {
        httpClient.post("/notifications/events/match-found", request, String.class);
    }

    /**
     * Publishes match expired event to notification-service.
     * Follows Open/Closed Principle: extends functionality without modifying existing code.
     */
    public void matchExpired(MatchExpiredRequest request) throws ServiceIntegrationException {
        httpClient.post("/notifications/events/match-expired", request, String.class);
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

    public static class MatchFoundRequest {
        public String userId;
        public String email;
        public String tripId;
        public String driverId;
        public double score;
        public String locale;
    }

    public static class MatchExpiredRequest {
        public String userId;
        public String email;
        public String tripId;
        public String locale;
    }
}


