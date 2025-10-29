package com.company.covoituraje.notification.service;

import com.company.covoituraje.notification.service.NotificationEvents.BookingConfirmedEvent;
import com.company.covoituraje.notification.service.NotificationEvents.NotificationEvent;
import com.company.covoituraje.notification.service.NotificationEvents.TripCancelledEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Email worker that consumes domain events and delegates to NotificationService.
 * This can be wired to a queue or invoked synchronously by services.
 */
@ApplicationScoped
public class EmailWorker {

    private final NotificationService notificationService;

    public EmailWorker() { this.notificationService = null; }

    @Inject
    public EmailWorker(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public void handle(NotificationEvent event) {
        if (event instanceof BookingConfirmedEvent e) {
            notificationService.sendBookingConfirmation(e.userId, e.email, e.tripId, e.seats, e.locale);
        } else if (event instanceof TripCancelledEvent e) {
            notificationService.sendTripCancellation(e.userId, e.email, e.tripId, e.locale);
        }
    }
}


