package com.hexagonal.meditation.generation.domain.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for NarrationScript value object.
 * TDD approach - tests first, domain logic second.
 */
class NarrationScriptTest {

    @Test
    void shouldCreateNarrationScriptWithValidText() {
        String text = "Close your eyes and breathe deeply";
        
        NarrationScript script = new NarrationScript(text);
        
        assertNotNull(script);
        assertEquals(text, script.text());
    }

    @Test
    void shouldRejectNullText() {
        assertThrows(IllegalArgumentException.class, () -> {
            new NarrationScript(null);
        });
    }

    @Test
    void shouldRejectBlankText() {
        assertThrows(IllegalArgumentException.class, () -> {
            new NarrationScript("   ");
        });
    }

    @Test
    void shouldRejectEmptyText() {
        assertThrows(IllegalArgumentException.class, () -> {
            new NarrationScript("");
        });
    }

    @Test
    void shouldRejectTextExceedingMaxLength() {
        String longText = "a".repeat(10_001);
        
        assertThrows(IllegalArgumentException.class, () -> {
            new NarrationScript(longText);
        });
    }

    @Test
    void shouldAcceptTextAtMaxLength() {
        String maxText = "a".repeat(10_000);
        
        NarrationScript script = new NarrationScript(maxText);
        
        assertNotNull(script);
        assertEquals(10_000, script.text().length());
    }

    @Test
    void shouldEstimateDurationForShortText() {
        // ~7 words → ~3 seconds at 150 wpm
        NarrationScript script = new NarrationScript("Close your eyes and breathe deeply now");
        
        int duration = script.estimateDurationSeconds();
        
        assertTrue(duration >= 2 && duration <= 4, "Expected ~3 seconds, got " + duration);
    }

    @Test
    void shouldEstimateDurationForLongerText() {
        // ~30 words → ~12 seconds at 150 wpm
        String text = "Welcome to your mindfulness meditation journey. " +
                     "Settle into a comfortable position and close your eyes. " +
                     "Begin by taking three deep breaths, feeling the air enter and leave your body.";
        NarrationScript script = new NarrationScript(text);
        
        int duration = script.estimateDurationSeconds();
        
        assertTrue(duration >= 10 && duration <= 15, "Expected ~12 seconds, got " + duration);
    }

    @Test
    void shouldRoundUpDurationEstimate() {
        // Even 1 word should take at least 1 second
        NarrationScript script = new NarrationScript("Breathe");
        
        int duration = script.estimateDurationSeconds();
        
        assertTrue(duration >= 1, "Expected at least 1 second");
    }
}
