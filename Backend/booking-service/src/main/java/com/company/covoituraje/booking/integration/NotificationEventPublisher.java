package com.company.covoituraje.booking.integration;

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
     * Publishes booking confirmed event to notification-service.
     * Handles errors gracefully to avoid breaking main business flow.
     */
    public void publishBookingConfirmed(String userId, String email, String tripId, int seats, Locale locale) {
        try {
            NotificationServiceClient.BookingConfirmedRequest request = new NotificationServiceClient.BookingConfirmedRequest();
            request.userId = userId;
            request.email = email;
            request.tripId = tripId;
            request.seats = seats;
            request.locale = locale.toLanguageTag();
            
            notificationClient.bookingConfirmed(request);
        } catch (Exception e) {
            System.err.println("Failed to publish booking confirmed event: " + e.getMessage());
            // Don't throw exception to avoid breaking main flow
        }
    }
    
    /**
     * Publishes trip cancelled event to notification-service.
     * Handles errors gracefully to avoid breaking main business flow.
     */
    public void publishTripCancelled(String userId, String email, String tripId, Locale locale) {
        try {
            NotificationServiceClient.TripCancelledRequest request = new NotificationServiceClient.TripCancelledRequest();
            request.userId = userId;
            request.email = email;
            request.tripId = tripId;
            request.locale = locale.toLanguageTag();
            
            notificationClient.tripCancelled(request);
        } catch (Exception e) {
            System.err.println("Failed to publish trip cancelled event: " + e.getMessage());
            // Don't throw exception to avoid breaking main flow
        }
    }
}
