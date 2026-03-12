package com.company.covoituraje.notification.domain;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;

class NotificationSubscriptionTest {
    
    private NotificationSubscription subscription;
    
    @BeforeEach
    void setUp() {
        subscription = new NotificationSubscription(
            "user-001",
            "https://fcm.googleapis.com/fcm/send/example",
            "p256dh-key-example",
            "auth-key-example"
        );
    }
    
    @Test
    void shouldCreateSubscriptionWithValidData() {
        // Given
        String userId = "user-001";
        String endpoint = "https://fcm.googleapis.com/fcm/send/example";
        String p256dhKey = "p256dh-key-example";
        String authKey = "auth-key-example";
        
        // When
        NotificationSubscription subscription = new NotificationSubscription(userId, endpoint, p256dhKey, authKey);
        
        // Then
        assertEquals(userId, subscription.getUserId());
        assertEquals(endpoint, subscription.getEndpoint());
        assertEquals(p256dhKey, subscription.getP256dhKey());
        assertEquals(authKey, subscription.getAuthKey());
        assertTrue(subscription.isActive());
        assertNotNull(subscription.getCreatedAt());
        assertNotNull(subscription.getLastUsed());
    }
    
    @Test
    void shouldSetTimestampsOnCreation() {
        // Given
        LocalDateTime beforeCreation = LocalDateTime.now();
        
        // When
        NotificationSubscription subscription = new NotificationSubscription(
            "user-001", 
            "https://fcm.googleapis.com/fcm/send/example",
            "p256dh-key",
            "auth-key"
        );
        
        // Then
        LocalDateTime afterCreation = LocalDateTime.now();
        assertTrue(subscription.getCreatedAt().isAfter(beforeCreation.minusSeconds(1)));
        assertTrue(subscription.getCreatedAt().isBefore(afterCreation.plusSeconds(1)));
        assertTrue(subscription.getLastUsed().isAfter(beforeCreation.minusSeconds(1)));
        assertTrue(subscription.getLastUsed().isBefore(afterCreation.plusSeconds(1)));
    }
    
    @Test
    void shouldUpdateLastUsedOnUpdate() {
        // Given
        LocalDateTime originalLastUsed = subscription.getLastUsed();
        
        // When
        subscription.setActive(false);
        // Simulate @PreUpdate
        subscription.onUpdate();
        
        // Then
        assertTrue(subscription.getLastUsed().isAfter(originalLastUsed));
    }
    
    @Test
    void shouldBeActiveByDefault() {
        // When
        NotificationSubscription subscription = new NotificationSubscription(
            "user-001", 
            "https://fcm.googleapis.com/fcm/send/example",
            "p256dh-key",
            "auth-key"
        );
        
        // Then
        assertTrue(subscription.isActive());
    }
    
    @Test
    void shouldAllowDeactivation() {
        // When
        subscription.setActive(false);
        
        // Then
        assertFalse(subscription.isActive());
    }
}
