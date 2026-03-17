package com.company.covoituraje.notification.service;

import com.company.covoituraje.notification.domain.NotificationSubscription;
import com.company.covoituraje.notification.repository.NotificationSubscriptionRepository;
import com.company.covoituraje.shared.i18n.MessageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class NotificationServiceTest {

    private NotificationService notificationService;
    private NotificationSubscriptionRepository subscriptionRepository;
    private PushNotificationService pushNotificationService;
    private EmailNotificationService emailNotificationService;
    private MessageService messageService;

    @BeforeEach
    void setUp() throws Exception {
        notificationService = new NotificationService();
        subscriptionRepository = mock(NotificationSubscriptionRepository.class);
        pushNotificationService = mock(PushNotificationService.class);
        emailNotificationService = mock(EmailNotificationService.class);
        messageService = mock(MessageService.class);

        // Inject mocks via reflection
        var repoField = NotificationService.class.getDeclaredField("subscriptionRepository");
        repoField.setAccessible(true);
        repoField.set(notificationService, subscriptionRepository);

        var pushField = NotificationService.class.getDeclaredField("pushNotificationService");
        pushField.setAccessible(true);
        pushField.set(notificationService, pushNotificationService);

        var emailField = NotificationService.class.getDeclaredField("emailNotificationService");
        emailField.setAccessible(true);
        emailField.set(notificationService, emailNotificationService);

        var messageField = NotificationService.class.getDeclaredField("messageService");
        messageField.setAccessible(true);
        messageField.set(notificationService, messageService);
    }

    @Test
    void shouldSubscribeUserToNotifications() {
        String userId = "user-001";
        String endpoint = "https://fcm.googleapis.com/fcm/send/example";
        String p256dhKey = "p256dh-key";
        String authKey = "auth-key";

        when(subscriptionRepository.findByUserIdAndEndpoint(userId, endpoint)).thenReturn(Optional.empty());
        ArgumentCaptor<NotificationSubscription> subscriptionCaptor = ArgumentCaptor.forClass(NotificationSubscription.class);
        NotificationSubscription expectedResult = new NotificationSubscription(userId, endpoint, p256dhKey, authKey);
        when(subscriptionRepository.save(any(NotificationSubscription.class))).thenReturn(expectedResult);

        NotificationSubscription result = notificationService.subscribeUser(userId, endpoint, p256dhKey, authKey);

        assertNotNull(result);
        verify(subscriptionRepository).save(subscriptionCaptor.capture());
        NotificationSubscription saved = subscriptionCaptor.getValue();
        assertEquals(userId, saved.getUserId());
        assertEquals(endpoint, saved.getEndpoint());
        assertEquals(p256dhKey, saved.getP256dhKey());
        assertEquals(authKey, saved.getAuthKey());
        assertTrue(saved.isActive());
    }

    @Test
    void shouldUpdateExistingSubscription() {
        String userId = "user-001";
        String endpoint = "https://fcm.googleapis.com/fcm/send/example";
        String newP256dhKey = "new-p256dh-key";
        String newAuthKey = "new-auth-key";

        NotificationSubscription existing = new NotificationSubscription(userId, endpoint, "old", "old");
        when(subscriptionRepository.findByUserIdAndEndpoint(userId, endpoint)).thenReturn(Optional.of(existing));
        when(subscriptionRepository.save(existing)).thenReturn(existing);

        NotificationSubscription result = notificationService.subscribeUser(userId, endpoint, newP256dhKey, newAuthKey);

        assertNotNull(result);
        assertEquals(newP256dhKey, result.getP256dhKey());
        assertEquals(newAuthKey, result.getAuthKey());
        assertTrue(result.isActive());
        verify(subscriptionRepository).save(existing);
    }

    @Test
    void shouldUnsubscribeUser() {
        String userId = "user-001";
        String endpoint = "https://fcm.googleapis.com/fcm/send/example";
        NotificationSubscription existing = new NotificationSubscription(userId, endpoint, "k", "a");
        when(subscriptionRepository.findByUserIdAndEndpoint(userId, endpoint)).thenReturn(Optional.of(existing));

        notificationService.unsubscribeUser(userId, endpoint);

        assertFalse(existing.isActive());
        verify(subscriptionRepository).save(existing);
    }

    @Test
    void shouldSendPushNotificationToUser() {
        String userId = "user-001";
        String title = "Nueva reserva";
        String body = "Tu reserva ha sido confirmada";
        NotificationSubscription s = new NotificationSubscription(userId, "https://e", "k", "a");
        when(subscriptionRepository.findActiveByUserId(userId)).thenReturn(List.of(s));
        when(pushNotificationService.sendNotificationWithOutcome(s, title, body))
            .thenReturn(PushNotificationService.SendOutcome.SUCCESS);

        notificationService.sendPushNotification(userId, title, body);

        verify(pushNotificationService).sendNotificationWithOutcome(s, title, body);
    }

    @Test
    void shouldSendEmailNotification() {
        String userId = "user-001";
        String email = "user@example.com";
        String subject = "Nueva reserva";
        String body = "Tu reserva ha sido confirmada";

        notificationService.sendEmailNotification(userId, email, subject, body);

        verify(emailNotificationService).sendEmail(email, subject, body);
    }

    @Test
    void shouldSendBookingConfirmationNotification() {
        String userId = "user-001";
        String email = "user@example.com";
        String tripId = "trip-001";
        int seatsRequested = 2;
        Locale locale = Locale.forLanguageTag("es");
        NotificationSubscription s = new NotificationSubscription(userId, "https://e", "k", "a");
        
        when(subscriptionRepository.findActiveByUserId(userId)).thenReturn(List.of(s));
        when(pushNotificationService.sendNotificationWithOutcome(eq(s), anyString(), anyString()))
            .thenReturn(PushNotificationService.SendOutcome.SUCCESS);
        when(messageService.getMessage("push.booking.confirmed.title", locale))
            .thenReturn("Reserva confirmada");
        when(messageService.getMessage("push.booking.confirmed.body", locale, seatsRequested))
            .thenReturn("Tu reserva de " + seatsRequested + " asientos ha sido confirmada");

        notificationService.sendBookingConfirmation(userId, email, tripId, seatsRequested, locale);

        verify(pushNotificationService).sendNotificationWithOutcome(eq(s), anyString(), anyString());
        verify(emailNotificationService).sendBookingConfirmation(email, tripId, seatsRequested, locale);
    }
}
