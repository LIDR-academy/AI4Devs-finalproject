package com.hexagonal.meditationbuilder.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for MusicReference value object.
 * TDD: Tests written FIRST before implementation.
 * 
 * Business Rules:
 * - Music is optional (can be null)
 * - When provided, reference must be valid (not empty)
 * - Immutable value object
 */
@DisplayName("MusicReference Value Object Tests")
class MusicReferenceTest {

    @Test
    @DisplayName("Should create MusicReference with valid reference")
    void shouldCreateMusicReferenceWithValidReference() {
        // Given
        String validReference = "calm-ocean-waves";
        
        // When
        MusicReference musicReference = new MusicReference(validReference);
        
        // Then
        assertNotNull(musicReference);
        assertEquals(validReference, musicReference.getValue());
    }

    @Test
    @DisplayName("Should reject null reference")
    void shouldRejectNullReference() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            new MusicReference(null);
        }, "Music reference cannot be null");
    }

    @Test
    @DisplayName("Should reject empty reference")
    void shouldRejectEmptyReference() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            new MusicReference("");
        }, "Music reference cannot be empty");
    }

    @Test
    @DisplayName("Should reject blank reference")
    void shouldRejectBlankReference() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            new MusicReference("   ");
        }, "Music reference cannot be blank");
    }

    @Test
    @DisplayName("Should implement value equality")
    void shouldImplementValueEquality() {
        // Given
        String reference = "relaxing-piano";
        MusicReference music1 = new MusicReference(reference);
        MusicReference music2 = new MusicReference(reference);
        MusicReference music3 = new MusicReference("different-music");
        
        // Then
        assertEquals(music1, music2, "Same reference should be equal");
        assertNotEquals(music1, music3, "Different reference should not be equal");
        assertEquals(music1.hashCode(), music2.hashCode(), "Equal objects should have same hashCode");
    }

    @Test
    @DisplayName("Should have meaningful toString")
    void shouldHaveMeaningfulToString() {
        // Given
        String reference = "calm-music";
        MusicReference musicReference = new MusicReference(reference);
        
        // When
        String toString = musicReference.toString();
        
        // Then
        assertNotNull(toString);
        assertTrue(toString.contains(reference) || toString.contains("MusicReference"));
    }
}
