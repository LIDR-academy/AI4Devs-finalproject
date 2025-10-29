package com.company.covoituraje.notification.service;

import com.company.covoituraje.shared.i18n.MessageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * TDD for TemplateEngine that renders templates with variables and i18n.
 * Follows SOLID principles by depending on MessageService abstraction.
 */
class TemplateEngineTest {

    private MessageService messageService;
    private TemplateEngine templateEngine;

    @BeforeEach
    void setUp() {
        messageService = Mockito.mock(MessageService.class);
        templateEngine = new TemplateEngine();
        
        // Inject mock via reflection
        try {
            var field = TemplateEngine.class.getDeclaredField("messageService");
            field.setAccessible(true);
            field.set(templateEngine, messageService);
        } catch (Exception e) {
            throw new RuntimeException("Failed to inject mock MessageService", e);
        }
    }

    @Test
    void rendersHtmlTemplateWithVariables() {
        // Given
        Map<String, Object> variables = Map.of(
            "userName", "John Doe",
            "tripId", "trip-123",
            "seats", 2,
            "tripDateTime", "2024-10-20 08:00",
            "origin", "Office",
            "destination", "Airport",
            "driverName", "Jane Smith",
            "appUrl", "https://app.covoituraje.com"
        );

        // When
        String result = templateEngine.render("booking-confirmation", variables, Locale.ENGLISH);

        // Then
        assertThat(result).contains("John Doe");
        assertThat(result).contains("trip-123");
        assertThat(result).contains("2");
        assertThat(result).contains("Office");
        assertThat(result).contains("Airport");
        assertThat(result).contains("Jane Smith");
        assertThat(result).contains("https://app.covoituraje.com");
    }

    @Test
    void rendersTemplateWithOnlyTripId() {
        // Given
        when(messageService.getMessage("email.trip.cancelled.subject", Locale.ENGLISH, "trip-456"))
                .thenReturn("Trip trip-456 has been cancelled");

        // When
        String result = templateEngine.render("email.trip.cancelled.subject", 
                Map.of("tripId", "trip-456"), Locale.ENGLISH);

        // Then
        assertThat(result).isEqualTo("Trip trip-456 has been cancelled");
        verify(messageService).getMessage("email.trip.cancelled.subject", Locale.ENGLISH, "trip-456");
    }

    @Test
    void rendersTemplateWithOnlySeats() {
        // Given
        when(messageService.getMessage("email.booking.reminder.body", Locale.ENGLISH, 3))
                .thenReturn("Reminder: You have 3 seats reserved");

        // When
        String result = templateEngine.render("email.booking.reminder.body", 
                Map.of("seats", 3), Locale.ENGLISH);

        // Then
        assertThat(result).isEqualTo("Reminder: You have 3 seats reserved");
        verify(messageService).getMessage("email.booking.reminder.body", Locale.ENGLISH, 3);
    }

    @Test
    void rendersTemplateWithoutVariables() {
        // Given
        when(messageService.getMessage("email.general.welcome", Locale.ENGLISH))
                .thenReturn("Welcome to Covoituraje!");

        // When
        String result = templateEngine.render("email.general.welcome", null, Locale.ENGLISH);

        // Then
        assertThat(result).isEqualTo("Welcome to Covoituraje!");
        verify(messageService).getMessage("email.general.welcome", Locale.ENGLISH);
    }

    @Test
    void supportsDifferentLocales() {
        // Given
        when(messageService.getMessage("email.booking.confirmed.subject", Locale.forLanguageTag("es"), "viaje-789", 1))
                .thenReturn("Reserva confirmada para el viaje viaje-789 con 1 asiento");

        // When
        String result = templateEngine.render("email.booking.confirmed.subject", 
                Map.of("tripId", "viaje-789", "seats", 1), Locale.forLanguageTag("es"));

        // Then
        assertThat(result).isEqualTo("Reserva confirmada para el viaje viaje-789 con 1 asiento");
        verify(messageService).getMessage("email.booking.confirmed.subject", Locale.forLanguageTag("es"), "viaje-789", 1);
    }

    @Test
    void supportsCatalanLocale() {
        // Given
        when(messageService.getMessage("email.trip.cancelled.subject", Locale.forLanguageTag("ca"), "viatge-123"))
                .thenReturn("El viatge viatge-123 ha estat cancel·lat");

        // When
        String result = templateEngine.render("email.trip.cancelled.subject", 
                Map.of("tripId", "viatge-123"), Locale.forLanguageTag("ca"));

        // Then
        assertThat(result).isEqualTo("El viatge viatge-123 ha estat cancel·lat");
        verify(messageService).getMessage("email.trip.cancelled.subject", Locale.forLanguageTag("ca"), "viatge-123");
    }

    @Test
    void handlesEmptyVariablesMap() {
        // Given
        when(messageService.getMessage("email.general.info", Locale.ENGLISH))
                .thenReturn("General information");

        // When
        String result = templateEngine.render("email.general.info", Map.of(), Locale.ENGLISH);

        // Then
        assertThat(result).isEqualTo("General information");
        verify(messageService).getMessage("email.general.info", Locale.ENGLISH);
    }

    @Test
    void handlesNullVariables() {
        // Given
        when(messageService.getMessage("email.general.info", Locale.ENGLISH))
                .thenReturn("General information");

        // When
        String result = templateEngine.render("email.general.info", null, Locale.ENGLISH);

        // Then
        assertThat(result).isEqualTo("General information");
        verify(messageService).getMessage("email.general.info", Locale.ENGLISH);
    }

    @Test
    void handlesVariablesWithNullValues() {
        // Given
        when(messageService.getMessage("email.booking.confirmed.subject", Locale.ENGLISH))
                .thenReturn("Booking confirmed");

        // When
        Map<String, Object> variables = new HashMap<>();
        variables.put("tripId", null);
        variables.put("seats", null);
        String result = templateEngine.render("email.booking.confirmed.subject", 
                variables, Locale.ENGLISH);

        // Then
        assertThat(result).isEqualTo("Booking confirmed");
        verify(messageService).getMessage("email.booking.confirmed.subject", Locale.ENGLISH);
    }

    @Test
    void rendersTemplateWithDifferentLocales() {
        // Given
        Map<String, Object> variables = Map.of(
            "userName", "María García",
            "tripId", "viaje-456",
            "seats", 1
        );

        // When
        String resultEs = templateEngine.render("booking-confirmation", variables, Locale.forLanguageTag("es"));
        String resultCa = templateEngine.render("booking-confirmation", variables, Locale.forLanguageTag("ca"));

        // Then
        assertThat(resultEs).contains("María García");
        assertThat(resultEs).contains("viaje-456");
        assertThat(resultCa).contains("María García");
        assertThat(resultCa).contains("viaje-456");
    }

    @Test
    void handlesTemplateCache() {
        // Given
        Map<String, Object> variables = Map.of("userName", "Test User");

        // When
        String result1 = templateEngine.render("booking-confirmation", variables, Locale.ENGLISH);
        String result2 = templateEngine.render("booking-confirmation", variables, Locale.ENGLISH);

        // Then
        assertThat(result1).isNotNull();
        assertThat(result2).isNotNull();
        assertThat(templateEngine.getCacheSize()).isGreaterThan(0);
    }

    @Test
    void clearsTemplateCache() {
        // Given
        Map<String, Object> variables = Map.of("userName", "Test User");
        templateEngine.render("booking-confirmation", variables, Locale.ENGLISH);

        // When
        templateEngine.clearCache();

        // Then
        assertThat(templateEngine.getCacheSize()).isEqualTo(0);
    }


    @Test
    void handlesEmptyVariables() {
        // When
        String result = templateEngine.render("booking-confirmation", Map.of(), Locale.ENGLISH);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).contains("{{userName}}"); // Variables not replaced
    }

    @Test
    void handlesNonExistentTemplate() {
        // Given
        Map<String, Object> variables = Map.of("userName", "Test User");

        // When
        String result = templateEngine.render("non-existent-template", variables, Locale.ENGLISH);

        // Then
        // Should fallback to MessageService
        verify(messageService).getMessage("non-existent-template", Locale.ENGLISH);
    }
}


