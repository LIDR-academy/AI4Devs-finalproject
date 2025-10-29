package com.company.covoituraje.matching.integration;

import java.util.Locale;

/**
 * Event publisher for domain events to notification-service.
 * Follows Single Responsibility Principle: only handles event publishing.
 * Follows Dependency Inversion Principle: depends on NotificationServiceClient abstraction.
 */
public class NotificationEventPublisher {
    
    private final NotificationServiceClient notificationClient;
    
    public NotificationEventPublisher(NotificationServiceClient notificationClient) {
        this.notificationClient = notificationClient;
    }
    
    /**
     * Publishes match found event to notification-service.
     * Handles errors gracefully to avoid breaking main business flow.
     */
    public void publishMatchFound(String userId, String email, String tripId, String driverId, double score, Locale locale) {
        try {
            NotificationServiceClient.MatchFoundRequest request = new NotificationServiceClient.MatchFoundRequest();
            request.userId = userId;
            request.email = email;
            request.tripId = tripId;
            request.driverId = driverId;
            request.score = score;
            request.locale = locale.toLanguageTag();
            
            notificationClient.matchFound(request);
        } catch (Exception e) {
            System.err.println("Failed to publish match found event: " + e.getMessage());
            // Don't throw exception to avoid breaking main flow
        }
    }
    
    /**
     * Publishes match expired event to notification-service.
     * Handles errors gracefully to avoid breaking main business flow.
     */
    public void publishMatchExpired(String userId, String email, String tripId, Locale locale) {
        try {
            NotificationServiceClient.MatchExpiredRequest request = new NotificationServiceClient.MatchExpiredRequest();
            request.userId = userId;
            request.email = email;
            request.tripId = tripId;
            request.locale = locale.toLanguageTag();
            
            notificationClient.matchExpired(request);
        } catch (Exception e) {
            System.err.println("Failed to publish match expired event: " + e.getMessage());
            // Don't throw exception to avoid breaking main flow
        }
    }
}
