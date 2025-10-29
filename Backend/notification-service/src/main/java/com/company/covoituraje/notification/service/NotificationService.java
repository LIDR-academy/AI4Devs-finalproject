package com.company.covoituraje.notification.service;

import com.company.covoituraje.notification.domain.NotificationSubscription;
import com.company.covoituraje.notification.repository.NotificationSubscriptionRepository;
import com.company.covoituraje.shared.i18n.MessageService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@ApplicationScoped
public class NotificationService {
    
    @Inject
    private NotificationSubscriptionRepository subscriptionRepository;
    
    @Inject
    private PushNotificationService pushNotificationService;
    
    @Inject
    private EmailNotificationService emailNotificationService;
    
    @Inject
    private MessageService messageService;
    
    public NotificationSubscription subscribeUser(String userId, String endpoint, String p256dhKey, String authKey) {
        Optional<NotificationSubscription> existing = subscriptionRepository.findByUserIdAndEndpoint(userId, endpoint);
        
        if (existing.isPresent()) {
            NotificationSubscription subscription = existing.get();
            subscription.setP256dhKey(p256dhKey);
            subscription.setAuthKey(authKey);
            subscription.setActive(true);
            return subscriptionRepository.save(subscription);
        } else {
            NotificationSubscription subscription = new NotificationSubscription(userId, endpoint, p256dhKey, authKey);
            return subscriptionRepository.save(subscription);
        }
    }
    
    public void unsubscribeUser(String userId, String endpoint) {
        Optional<NotificationSubscription> subscription = subscriptionRepository.findByUserIdAndEndpoint(userId, endpoint);
        if (subscription.isPresent()) {
            subscription.get().setActive(false);
            subscriptionRepository.save(subscription.get());
        }
    }
    
    public void sendPushNotification(String userId, String title, String body) {
        List<NotificationSubscription> subscriptions = subscriptionRepository.findActiveByUserId(userId);
        for (NotificationSubscription subscription : subscriptions) {
            PushNotificationService.SendOutcome outcome = pushNotificationService.sendNotificationWithOutcome(
                subscription, 
                title, 
                body
            );
            if (outcome == PushNotificationService.SendOutcome.RETRYABLE_FAILURE) {
                // simple bounded retry with backoff
                int attempts = 0;
                while (attempts < 2 && outcome == PushNotificationService.SendOutcome.RETRYABLE_FAILURE) {
                    attempts++;
                    try {
                        Thread.sleep(250L * attempts);
                    } catch (InterruptedException ignored) {}
                    outcome = pushNotificationService.sendNotificationWithOutcome(
                        subscription, 
                        title, 
                        body
                    );
                }
            }
            if (outcome == PushNotificationService.SendOutcome.GONE) {
                subscription.setActive(false);
                subscriptionRepository.save(subscription);
            }
        }
    }
    
    public void sendEmailNotification(String userId, String email, String subject, String body) {
        emailNotificationService.sendEmail(email, subject, body);
    }
    
    public void sendBookingConfirmation(String userId, String email, String tripId, int seatsRequested, Locale locale) {
        // Send push notification
        String pushTitle = messageService.getMessage("push.booking.confirmed.title", locale);
        String pushBody = messageService.getMessage("push.booking.confirmed.body", locale, seatsRequested);
        sendPushNotification(userId, pushTitle, pushBody);
        
        // Send email notification
        emailNotificationService.sendBookingConfirmation(email, tripId, seatsRequested, locale);
    }
    
    public void sendTripCancellation(String userId, String email, String tripId, Locale locale) {
        // Send push notification
        String pushTitle = messageService.getMessage("push.trip.cancelled.title", locale);
        String pushBody = messageService.getMessage("push.trip.cancelled.body", locale, tripId);
        sendPushNotification(userId, pushTitle, pushBody);
        
        // Send email notification
        emailNotificationService.sendTripCancellation(email, tripId, locale);
    }
}
