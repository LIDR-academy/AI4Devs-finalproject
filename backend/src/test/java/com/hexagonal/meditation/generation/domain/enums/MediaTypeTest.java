package com.hexagonal.meditation.generation.domain.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for MediaType enum.
 * Validates enum values and behavior.
 */
class MediaTypeTest {

    @Test
    void shouldHaveAudioValue() {
        MediaType mediaType = MediaType.AUDIO;
        
        assertNotNull(mediaType);
        assertEquals("AUDIO", mediaType.name());
    }

    @Test
    void shouldHaveVideoValue() {
        MediaType mediaType = MediaType.VIDEO;
        
        assertNotNull(mediaType);
        assertEquals("VIDEO", mediaType.name());
    }

    @Test
    void shouldHaveExactlyTwoValues() {
        MediaType[] values = MediaType.values();
        
        assertEquals(2, values.length);
    }

    @Test
    void shouldParseFromString() {
        MediaType audio = MediaType.valueOf("AUDIO");
        MediaType video = MediaType.valueOf("VIDEO");
        
        assertEquals(MediaType.AUDIO, audio);
        assertEquals(MediaType.VIDEO, video);
    }
}
