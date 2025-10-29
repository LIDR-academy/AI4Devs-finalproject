package com.company.covoituraje.notification.service;

import jakarta.enterprise.context.ApplicationScoped;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import nl.martijndwars.webpush.Urgency;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Service for sending push notifications using VAPID.
 * Follows Single Responsibility Principle: only handles push notification sending.
 * Follows Dependency Inversion Principle: depends on web-push library abstraction.
 */
@ApplicationScoped
public class PushNotificationService {

    private final PushService pushService;
    private final ExecutorService executorService;

    public PushNotificationService() {
        String vapidPublicKey = System.getProperty("VAPID_PUBLIC_KEY");
        String vapidPrivateKey = System.getProperty("VAPID_PRIVATE_KEY");
        
        if (vapidPublicKey == null || vapidPrivateKey == null) {
            throw new IllegalStateException("VAPID keys not configured. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.");
        }
        
        this.pushService = new PushService();
        this.executorService = Executors.newFixedThreadPool(10);
    }

    /**
     * Sends a push notification asynchronously.
     * Handles errors gracefully to avoid breaking main business flow.
     */
    public CompletableFuture<SendOutcome> sendNotificationAsync(String endpoint, String p256dhKey, String authKey, String title, String body) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return sendNotificationWithOutcome(endpoint, p256dhKey, authKey, title, body);
            } catch (Exception e) {
                System.err.println("Error sending push notification: " + e.getMessage());
                return SendOutcome.FAILURE;
            }
        }, executorService);
    }

    /**
     * Sends a push notification synchronously and returns the outcome.
     * Used for testing and immediate feedback scenarios.
     */
    public SendOutcome sendNotificationWithOutcome(String endpoint, String p256dhKey, String authKey, String title, String body) {
        try {
            Subscription.Keys keys = new Subscription.Keys(p256dhKey, authKey);
            Subscription subscription = new Subscription(endpoint, keys);
            String payload = String.format("{\"title\":\"%s\",\"body\":\"%s\"}", title, body);
            Notification notification = new Notification(subscription, payload, Urgency.NORMAL);
            
            pushService.send(notification);
            return SendOutcome.SUCCESS;
            
        } catch (Exception e) {
            System.err.println("Failed to send push notification: " + e.getMessage());
            
            // Determine if this is a retryable failure
            if (isRetryableError(e)) {
                return SendOutcome.RETRYABLE_FAILURE;
            } else if (isGoneError(e)) {
                return SendOutcome.GONE;
            } else {
                return SendOutcome.FAILURE;
            }
        }
    }

    /**
     * Overloaded method for compatibility with existing tests.
     * Accepts NotificationSubscription object directly.
     */
    public SendOutcome sendNotificationWithOutcome(com.company.covoituraje.notification.domain.NotificationSubscription subscription, String title, String body) {
        return sendNotificationWithOutcome(
            subscription.getEndpoint(),
            subscription.getP256dhKey(),
            subscription.getAuthKey(),
            title,
            body
        );
    }

    /**
     * Sends a push notification with custom payload.
     * Allows for rich notifications with actions, icons, etc.
     */
    public SendOutcome sendNotificationWithPayload(String endpoint, String p256dhKey, String authKey, String payload) {
        try {
            Subscription.Keys keys = new Subscription.Keys(p256dhKey, authKey);
            Subscription subscription = new Subscription(endpoint, keys);
            Notification notification = new Notification(subscription, payload, Urgency.NORMAL);
            
            pushService.send(notification);
            return SendOutcome.SUCCESS;
            
        } catch (Exception e) {
            System.err.println("Failed to send push notification with payload: " + e.getMessage());
            
            if (isRetryableError(e)) {
                return SendOutcome.RETRYABLE_FAILURE;
            } else if (isGoneError(e)) {
                return SendOutcome.GONE;
            } else {
                return SendOutcome.FAILURE;
            }
        }
    }

    /**
     * Determines if an error is retryable (network issues, temporary failures).
     */
    private boolean isRetryableError(Exception e) {
        String message = e.getMessage().toLowerCase();
        return message.contains("timeout") || 
               message.contains("connection") || 
               message.contains("network") ||
               message.contains("temporary");
    }

    /**
     * Determines if an error indicates the subscription is gone (user unsubscribed).
     */
    private boolean isGoneError(Exception e) {
        String message = e.getMessage().toLowerCase();
        return message.contains("gone") || 
               message.contains("410") ||
               message.contains("not found");
    }

    /**
     * Enum representing the outcome of a push notification send attempt.
     */
    public enum SendOutcome {
        SUCCESS,
        RETRYABLE_FAILURE,
        GONE,
        FAILURE
    }
}