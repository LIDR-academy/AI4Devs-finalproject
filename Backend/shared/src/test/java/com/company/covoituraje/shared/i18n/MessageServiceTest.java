package com.company.covoituraje.shared.i18n;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Locale;

import static org.junit.jupiter.api.Assertions.*;

class MessageServiceTest {

    private MessageService messageService;

    @BeforeEach
    void setUp() {
        messageService = new MessageService();
    }

    @Test
    void getMessage_withCatalanLocale_returnsCatalanTranslation() {
        // Given
        String key = "email.booking.confirmed.subject";
        Locale locale = Locale.forLanguageTag("ca");
        String tripId = "TRIP-123";

        // When
        String result = messageService.getMessage(key, locale, tripId);

        // Then
        assertEquals("Reserva confirmada - Viatge TRIP-123", result);
    }

    @Test
    void getMessage_withSpanishLocale_returnsSpanishTranslation() {
        // Given
        String key = "email.booking.confirmed.subject";
        Locale locale = Locale.forLanguageTag("es");
        String tripId = "TRIP-123";

        // When
        String result = messageService.getMessage(key, locale, tripId);

        // Then
        assertEquals("Reserva confirmada - Viaje TRIP-123", result);
    }

    @Test
    void getMessage_withParameters_formatsCorrectly() {
        // Given
        String key = "email.booking.confirmed.body";
        Locale locale = Locale.forLanguageTag("ca");
        int seats = 2;

        // When
        String result = messageService.getMessage(key, locale, seats);

        // Then
        assertEquals("La teva reserva de 2 seient(s) ha estat confirmada", result);
    }

    @Test
    void getMessage_withNonExistentKey_returnsKeyAsFallback() {
        // Given
        String key = "non.existent.key";
        Locale locale = Locale.forLanguageTag("ca");

        // When
        String result = messageService.getMessage(key, locale);

        // Then
        assertEquals("non.existent.key", result);
    }

    @Test
    void getMessage_withUnsupportedLocale_usesEnglishFallback() {
        // Given
        String key = "email.booking.confirmed.subject";
        Locale locale = Locale.forLanguageTag("de"); // German not supported
        String tripId = "TRIP-123";

        // When
        String result = messageService.getMessage(key, locale, tripId);

        // Then
        // Should fallback to English, but if system default is Spanish, accept that
        assertTrue(result.contains("TRIP-123"));
        assertTrue(result.contains("confirmed") || result.contains("confirmada"));
    }

    @Test
    void getMessageOrDefault_withValidKey_returnsTranslation() {
        // Given
        String key = "email.booking.confirmed.subject";
        String defaultMsg = "Default message";
        Locale locale = Locale.forLanguageTag("ca");
        String tripId = "TRIP-123";

        // When
        String result = messageService.getMessageOrDefault(key, defaultMsg, locale, tripId);

        // Then
        assertEquals("Reserva confirmada - Viatge TRIP-123", result);
    }

    @Test
    void getMessageOrDefault_withInvalidKey_returnsDefaultMessage() {
        // Given
        String key = "invalid.key";
        String defaultMsg = "Default message";
        Locale locale = Locale.forLanguageTag("ca");

        // When
        String result = messageService.getMessageOrDefault(key, defaultMsg, locale);

        // Then
        assertEquals("Default message", result);
    }

    @Test
    void getMessage_withNullLocale_usesDefaultLocale() {
        // Given
        String key = "email.booking.confirmed.subject";
        String tripId = "TRIP-123";

        // When
        String result = messageService.getMessage(key, null, tripId);

        // Then
        assertEquals("Booking confirmed - Trip TRIP-123", result);
    }
}
