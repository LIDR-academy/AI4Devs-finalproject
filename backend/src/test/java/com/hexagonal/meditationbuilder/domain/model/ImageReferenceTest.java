package com.hexagonal.meditationbuilder.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for ImageReference value object.
 * TDD: Tests written FIRST before implementation.
 * 
 * Business Rules:
 * - Image is optional (can be null in composition)
 * - When provided, reference must be valid (not empty)
 * - Can be manual or AI-generated
 * - Immutable value object
 */
@DisplayName("ImageReference Value Object Tests")
class ImageReferenceTest {

    @Test
    @DisplayName("Should create ImageReference with valid reference")
    void shouldCreateImageReferenceWithValidReference() {
        // Given
        String validReference = "sunset-beach-001";
        
        // When
        ImageReference imageReference = new ImageReference(validReference);
        
        // Then
        assertNotNull(imageReference);
        assertEquals(validReference, imageReference.value());
    }

    @Test
    @DisplayName("Should create ImageReference for AI-generated image")
    void shouldCreateImageReferenceForAiGeneratedImage() {
        // Given
        String aiGeneratedReference = "ai-generated-sunset-beach-12345";
        
        // When
        ImageReference imageReference = new ImageReference(aiGeneratedReference);
        
        // Then
        assertNotNull(imageReference);
        assertEquals(aiGeneratedReference, imageReference.value());
    }

    @Test
    @DisplayName("Should reject null reference")
    void shouldRejectNullReference() {
        // When & Then
        assertThrows(NullPointerException.class, () -> {
            new ImageReference(null);
        }, "Image reference cannot be null");
    }

    @Test
    @DisplayName("Should reject empty reference")
    void shouldRejectEmptyReference() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            new ImageReference("");
        }, "Image reference cannot be empty");
    }

    @Test
    @DisplayName("Should reject blank reference")
    void shouldRejectBlankReference() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            new ImageReference("   ");
        }, "Image reference cannot be blank");
    }

    @Test
    @DisplayName("Should implement value equality")
    void shouldImplementValueEquality() {
        // Given
        String reference = "mountain-view";
        ImageReference image1 = new ImageReference(reference);
        ImageReference image2 = new ImageReference(reference);
        ImageReference image3 = new ImageReference("different-image");
        
        // Then
        assertEquals(image1, image2, "Same reference should be equal");
        assertNotEquals(image1, image3, "Different reference should not be equal");
        assertEquals(image1.hashCode(), image2.hashCode(), "Equal objects should have same hashCode");
    }

    @Test
    @DisplayName("Should have meaningful toString")
    void shouldHaveMeaningfulToString() {
        // Given
        String reference = "calm-lake";
        ImageReference imageReference = new ImageReference(reference);
        
        // When
        String toString = imageReference.toString();
        
        // Then
        assertNotNull(toString);
        assertTrue(toString.contains(reference) || toString.contains("ImageReference"));
    }
}
