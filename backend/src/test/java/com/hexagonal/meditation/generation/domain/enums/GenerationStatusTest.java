package com.hexagonal.meditation.generation.domain.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for GenerationStatus enum.
 * Validates enum values and behavior.
 */
class GenerationStatusTest {

    @Test
    void shouldHaveProcessingValue() {
        GenerationStatus status = GenerationStatus.PROCESSING;
        
        assertNotNull(status);
        assertEquals("PROCESSING", status.name());
    }

    @Test
    void shouldHaveCompletedValue() {
        GenerationStatus status = GenerationStatus.COMPLETED;
        
        assertNotNull(status);
        assertEquals("COMPLETED", status.name());
    }

    @Test
    void shouldHaveFailedValue() {
        GenerationStatus status = GenerationStatus.FAILED;
        
        assertNotNull(status);
        assertEquals("FAILED", status.name());
    }

    @Test
    void shouldHaveTimeoutValue() {
        GenerationStatus status = GenerationStatus.TIMEOUT;
        
        assertNotNull(status);
        assertEquals("TIMEOUT", status.name());
    }

    @Test
    void shouldHaveExactlyFourValues() {
        GenerationStatus[] values = GenerationStatus.values();
        
        assertEquals(4, values.length);
    }

    @Test
    void shouldParseFromString() {
        GenerationStatus processing = GenerationStatus.valueOf("PROCESSING");
        GenerationStatus completed = GenerationStatus.valueOf("COMPLETED");
        GenerationStatus failed = GenerationStatus.valueOf("FAILED");
        GenerationStatus timeout = GenerationStatus.valueOf("TIMEOUT");
        
        assertEquals(GenerationStatus.PROCESSING, processing);
        assertEquals(GenerationStatus.COMPLETED, completed);
        assertEquals(GenerationStatus.FAILED, failed);
        assertEquals(GenerationStatus.TIMEOUT, timeout);
    }
}
