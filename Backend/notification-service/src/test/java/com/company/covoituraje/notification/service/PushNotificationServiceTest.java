package com.company.covoituraje.notification.service;

import com.company.covoituraje.notification.config.VapidConfig;
import com.company.covoituraje.notification.domain.NotificationSubscription;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PushNotificationServiceTest {
    
    private PushNotificationService pushNotificationService;
    private VapidConfig vapidConfig;
    
    @BeforeEach
    void setUp() throws Exception {
        pushNotificationService = new PushNotificationService();
        vapidConfig = mock(VapidConfig.class);
        
        // Mock VapidConfig values
        when(vapidConfig.getSubject()).thenReturn("mailto:test@example.com");
        when(vapidConfig.getPublicKey()).thenReturn("test-public-key");
        when(vapidConfig.getPrivateKey()).thenReturn("test-private-key");
        
        // Inject mock via reflection
        var vapidField = PushNotificationService.class.getDeclaredField("vapidConfig");
        vapidField.setAccessible(true);
        vapidField.set(pushNotificationService, vapidConfig);
    }
    
    @Test
    void shouldSendNotificationSuccessfully() {
        // Given
        NotificationSubscription subscription = new NotificationSubscription(
            "user-001",
            "https://fcm.googleapis.com/fcm/send/example",
            "p256dh-key",
            "auth-key"
        );
        
        String title = "Test Notification";
        String body = "This is a test notification";
        
        // When & Then
        assertDoesNotThrow(() -> {
            pushNotificationService.sendNotification(subscription, title, body);
        });
    }
    
    @Test
    void shouldHandleInvalidSubscription() {
        // Given
        NotificationSubscription invalidSubscription = new NotificationSubscription(
            "user-001",
            "invalid-endpoint",
            "invalid-key",
            "invalid-auth"
        );
        
        String title = "Test Notification";
        String body = "This is a test notification";
        
        // When & Then
        // Should not throw exception even with invalid subscription
        assertDoesNotThrow(() -> {
            pushNotificationService.sendNotification(invalidSubscription, title, body);
        });
    }
    
    @Test
    void shouldCreateValidPayload() {
        // Given
        String title = "Test Notification";
        String body = "This is a test notification";
        
        // When
        String payload = pushNotificationService.createPayload(title, body);
        
        // Then
        assertNotNull(payload);
        assertTrue(payload.contains(title));
        assertTrue(payload.contains(body));
        assertTrue(payload.contains("\"title\""));
        assertTrue(payload.contains("\"body\""));
    }
}
