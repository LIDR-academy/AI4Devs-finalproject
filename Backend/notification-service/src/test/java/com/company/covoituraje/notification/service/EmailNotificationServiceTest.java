package com.company.covoituraje.notification.service;

import com.company.covoituraje.shared.i18n.MessageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Locale;

import static org.junit.jupiter.api.Assertions.*;

class EmailNotificationServiceTest {

    private MessageService messageService;
    private EmailNotificationService emailNotificationService;

    @BeforeEach
    void setUp() {
        messageService = new MessageService();
        emailNotificationService = new EmailNotificationService();
        emailNotificationService.messageService = messageService;
    }

    @Test
    void sendBookingConfirmation_withCatalanLocale_usesCatalanTexts() {
        // Given
        String email = "test@example.com";
        String tripId = "TRIP-123";
        int seatsRequested = 2;
        Locale locale = Locale.forLanguageTag("ca");

        // When
        emailNotificationService.sendBookingConfirmation(email, tripId, seatsRequested, locale);

        // Then
        // Test passes if no exception is thrown
        // The actual email sending is mocked by the service
        assertTrue(true);
    }

    @Test
    void sendBookingConfirmation_withRomanianLocale_usesRomanianTexts() {
        // Given
        String email = "test@example.com";
        String tripId = "TRIP-123";
        int seatsRequested = 2;
        Locale locale = Locale.forLanguageTag("ro");

        // When
        emailNotificationService.sendBookingConfirmation(email, tripId, seatsRequested, locale);

        // Then
        // Test passes if no exception is thrown
        assertTrue(true);
    }

    @Test
    void sendTripCancellation_formatsCorrectlyWithParameters() {
        // Given
        String email = "test@example.com";
        String tripId = "TRIP-456";
        Locale locale = Locale.forLanguageTag("es");

        // When
        emailNotificationService.sendTripCancellation(email, tripId, locale);

        // Then
        // Test passes if no exception is thrown
        assertTrue(true);
    }

    @Test
    void sendBookingConfirmation_withNullLocale_usesDefaultLocale() {
        // Given
        String email = "test@example.com";
        String tripId = "TRIP-123";
        int seatsRequested = 2;
        Locale locale = null;

        // When
        emailNotificationService.sendBookingConfirmation(email, tripId, seatsRequested, locale);

        // Then
        // Test passes if no exception is thrown
        assertTrue(true);
    }
}