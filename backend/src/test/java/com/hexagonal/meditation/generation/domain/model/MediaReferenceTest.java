package com.hexagonal.meditation.generation.domain.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for MediaReference value object.
 * TDD approach - validates reference format.
 */
class MediaReferenceTest {

    @Test
    void shouldCreateMediaReferenceWithValidReference() {
        String reference = "calm-ocean-waves";
        
        MediaReference mediaRef = new MediaReference(reference);
        
        assertNotNull(mediaRef);
        assertEquals(reference, mediaRef.reference());
    }

    @Test
    void shouldRejectNullReference() {
        assertThrows(IllegalArgumentException.class, () -> {
            new MediaReference(null);
        });
    }

    @Test
    void shouldRejectBlankReference() {
        assertThrows(IllegalArgumentException.class, () -> {
            new MediaReference("   ");
        });
    }

    @Test
    void shouldRejectEmptyReference() {
        assertThrows(IllegalArgumentException.class, () -> {
            new MediaReference("");
        });
    }

    @Test
    void shouldRejectReferenceExceedingMaxLength() {
        String longRef = "a".repeat(501);
        
        assertThrows(IllegalArgumentException.class, () -> {
            new MediaReference(longRef);
        });
    }

    @Test
    void shouldAcceptReferenceAtMaxLength() {
        String maxRef = "a".repeat(500);
        
        MediaReference mediaRef = new MediaReference(maxRef);
        
        assertNotNull(mediaRef);
        assertEquals(500, mediaRef.reference().length());
    }

    @Test
    void shouldRecognizeHttpUrl() {
        MediaReference mediaRef = new MediaReference("http://example.com/music.mp3");
        
        assertTrue(mediaRef.isUrl());
        assertFalse(mediaRef.isLocalPath());
    }

    @Test
    void shouldRecognizeHttpsUrl() {
        MediaReference mediaRef = new MediaReference("https://example.com/image.jpg");
        
        assertTrue(mediaRef.isUrl());
        assertFalse(mediaRef.isLocalPath());
    }

    @Test
    void shouldRecognizeLocalPath() {
        MediaReference mediaRef = new MediaReference("calm-ocean-waves");
        
        assertTrue(mediaRef.isLocalPath());
        assertFalse(mediaRef.isUrl());
    }

    @Test
    void shouldRecognizeLocalFileSystemPath() {
        MediaReference mediaRef = new MediaReference("/tmp/meditation/music.mp3");
        
        assertTrue(mediaRef.isLocalPath());
        assertFalse(mediaRef.isUrl());
    }

    @Test
    void shouldRecognizeWindowsPath() {
        MediaReference mediaRef = new MediaReference("C:\\temp\\image.jpg");
        
        assertTrue(mediaRef.isLocalPath());
        assertFalse(mediaRef.isUrl());
    }

    @Test
    void shouldRecognizeS3StyleReference() {
        MediaReference mediaRef = new MediaReference("s3://bucket/key/file.mp3");
        
        // s3:// is not http(s)://, so treated as local/custom protocol
        assertTrue(mediaRef.isLocalPath());
        assertFalse(mediaRef.isUrl());
    }
}
