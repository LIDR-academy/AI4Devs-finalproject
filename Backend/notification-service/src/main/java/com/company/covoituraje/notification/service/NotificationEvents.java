package com.company.covoituraje.notification.service;

import java.util.Locale;

/**
 * Domain events for notifications. These are simple immutable value objects.
 */
public final class NotificationEvents {

    private NotificationEvents() {}

    public interface NotificationEvent { }

    public static final class BookingConfirmedEvent implements NotificationEvent {
        public final String userId;
        public final String email;
        public final String tripId;
        public final int seats;
        public final Locale locale;

        public BookingConfirmedEvent(String userId, String email, String tripId, int seats, Locale locale) {
            this.userId = userId;
            this.email = email;
            this.tripId = tripId;
            this.seats = seats;
            this.locale = locale;
        }
    }

    public static final class TripCancelledEvent implements NotificationEvent {
        public final String userId;
        public final String email;
        public final String tripId;
        public final Locale locale;

        public TripCancelledEvent(String userId, String email, String tripId, Locale locale) {
            this.userId = userId;
            this.email = email;
            this.tripId = tripId;
            this.locale = locale;
        }
    }
}


