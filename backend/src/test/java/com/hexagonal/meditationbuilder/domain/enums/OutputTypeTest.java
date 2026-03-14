package com.hexagonal.meditationbuilder.domain.enums;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for OutputType enum.
 * 
 * Business Rules (from BDD Scenarios 5 & 6):
 * - PODCAST: audio-only output (no image selected)
 * - VIDEO: video output (image selected - manual or AI-generated)
 */
@DisplayName("OutputType Enum Tests")
class OutputTypeTest {

    @Test
    @DisplayName("Should have PODCAST value")
    void shouldHavePodcastValue() {
        // When
        OutputType outputType = OutputType.PODCAST;
        
        // Then
        assertNotNull(outputType);
        assertEquals("PODCAST", outputType.name());
    }

    @Test
    @DisplayName("Should have VIDEO value")
    void shouldHaveVideoValue() {
        // When
        OutputType outputType = OutputType.VIDEO;
        
        // Then
        assertNotNull(outputType);
        assertEquals("VIDEO", outputType.name());
    }

    @Test
    @DisplayName("Should have exactly 2 values")
    void shouldHaveExactlyTwoValues() {
        // When
        OutputType[] values = OutputType.values();
        
        // Then
        assertEquals(2, values.length, "OutputType should have exactly 2 values");
    }

    @Test
    @DisplayName("Should support valueOf conversion")
    void shouldSupportValueOfConversion() {
        // When
        OutputType podcast = OutputType.valueOf("PODCAST");
        OutputType video = OutputType.valueOf("VIDEO");
        
        // Then
        assertEquals(OutputType.PODCAST, podcast);
        assertEquals(OutputType.VIDEO, video);
    }

    @Test
    @DisplayName("Should be comparable")
    void shouldBeComparable() {
        // Given
        OutputType podcast = OutputType.PODCAST;
        OutputType video = OutputType.VIDEO;
        
        // Then
        assertNotEquals(podcast, video);
        assertEquals(podcast, OutputType.PODCAST);
        assertEquals(video, OutputType.VIDEO);
    }
}
