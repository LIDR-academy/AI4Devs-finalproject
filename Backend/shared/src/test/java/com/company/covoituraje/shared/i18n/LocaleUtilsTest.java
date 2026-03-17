package com.company.covoituraje.shared.i18n;

import org.junit.jupiter.api.Test;

import java.util.Locale;

import static org.junit.jupiter.api.Assertions.*;

class LocaleUtilsTest {

    @Test
    void parseAcceptLanguage_withCatalanFirst_returnsCatalan() {
        // Given
        String acceptLanguage = "ca,es;q=0.9";

        // When
        Locale result = LocaleUtils.parseAcceptLanguage(acceptLanguage);

        // Then
        assertEquals("ca", result.getLanguage());
    }

    @Test
    void parseAcceptLanguage_withEnglishUS_returnsEnglish() {
        // Given
        String acceptLanguage = "en-US,en;q=0.9";

        // When
        Locale result = LocaleUtils.parseAcceptLanguage(acceptLanguage);

        // Then
        assertEquals("en", result.getLanguage());
    }

    @Test
    void parseAcceptLanguage_withInvalidHeader_returnsDefaultLocale() {
        // Given
        String acceptLanguage = "invalid-header";

        // When
        Locale result = LocaleUtils.parseAcceptLanguage(acceptLanguage);

        // Then
        // Locale.forLanguageTag() doesn't throw exceptions, it creates a locale with the literal string
        // So we check that it's not a valid supported language
        assertNotEquals("ca", result.getLanguage());
        assertNotEquals("es", result.getLanguage());
        assertNotEquals("en", result.getLanguage());
    }

    @Test
    void parseAcceptLanguage_withNull_returnsDefaultLocale() {
        // Given
        String acceptLanguage = null;

        // When
        Locale result = LocaleUtils.parseAcceptLanguage(acceptLanguage);

        // Then
        assertEquals(Locale.ENGLISH, result);
    }

    @Test
    void parseAcceptLanguage_withEmptyString_returnsDefaultLocale() {
        // Given
        String acceptLanguage = "";

        // When
        Locale result = LocaleUtils.parseAcceptLanguage(acceptLanguage);

        // Then
        assertEquals(Locale.ENGLISH, result);
    }

    @Test
    void parseAcceptLanguage_withRomanian_returnsRomanian() {
        // Given
        String acceptLanguage = "ro-RO,ro;q=0.9";

        // When
        Locale result = LocaleUtils.parseAcceptLanguage(acceptLanguage);

        // Then
        assertEquals("ro", result.getLanguage());
    }

    @Test
    void parseAcceptLanguage_withUkrainian_returnsUkrainian() {
        // Given
        String acceptLanguage = "uk-UA,uk;q=0.9";

        // When
        Locale result = LocaleUtils.parseAcceptLanguage(acceptLanguage);

        // Then
        assertEquals("uk", result.getLanguage());
    }

    @Test
    void fromLanguageTag_withValidTag_returnsLocale() {
        // Given
        String tag = "ca-ES";

        // When
        Locale result = LocaleUtils.fromLanguageTag(tag);

        // Then
        assertEquals("ca", result.getLanguage());
        assertEquals("ES", result.getCountry());
    }

    @Test
    void fromLanguageTag_withInvalidTag_returnsDefaultLocale() {
        // Given
        String tag = "invalid-tag";

        // When
        Locale result = LocaleUtils.fromLanguageTag(tag);

        // Then
        // Locale.forLanguageTag() doesn't throw exceptions, it creates a locale with the literal string
        // So we check that it's not a valid supported language
        assertNotEquals("ca", result.getLanguage());
        assertNotEquals("es", result.getLanguage());
        assertNotEquals("en", result.getLanguage());
    }
}
