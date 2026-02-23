package com.hexagonal.meditationbuilder.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for TextContent value object.
 * TDD: Tests written FIRST before implementation.
 * 
 * Business Rules (from BDD Scenario 2):
 * - Text must be preserved exactly as provided
 * - Text cannot be null or empty
 * - Text has maximum length of 10,000 characters
 */
@DisplayName("TextContent Value Object Tests")
class TextContentTest {

    @Test
    @DisplayName("Should create TextContent with valid text")
    void shouldCreateTextContentWithValidText() {
        // Given
        String validText = "Close your eyes and breathe deeply...";
        
        // When
        TextContent textContent = new TextContent(validText);
        
        // Then
        assertNotNull(textContent);
        assertEquals(validText, textContent.value());
    }

    @Test
    @DisplayName("Should preserve text exactly as provided")
    void shouldPreserveTextExactly() {
        // Given
        String textWithSpaces = "  Text with   multiple   spaces  ";
        String textWithNewlines = "Line 1\n\nLine 2\nLine 3";
        
        // When
        TextContent content1 = new TextContent(textWithSpaces);
        TextContent content2 = new TextContent(textWithNewlines);
        
        // Then
        assertEquals(textWithSpaces, content1.value(), "Spaces must be preserved exactly");
        assertEquals(textWithNewlines, content2.value(), "Newlines must be preserved exactly");
    }

    @Test
    @DisplayName("Should reject null text")
    void shouldRejectNullText() {
        // When & Then
        assertThrows(NullPointerException.class, () -> {
            new TextContent(null);
        }, "Text content cannot be null");
    }

    @Test
    @DisplayName("Should reject empty text")
    void shouldRejectEmptyText() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            new TextContent("");
        }, "Text content cannot be empty");
    }

    @Test
    @DisplayName("Should reject blank text")
    void shouldRejectBlankText() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            new TextContent("   ");
        }, "Text content cannot be blank");
    }

    @Test
    @DisplayName("Should accept text up to 10,000 characters")
    void shouldAcceptTextUpToMaxLength() {
        // Given
        String maxLengthText = "A".repeat(10000);
        
        // When
        TextContent textContent = new TextContent(maxLengthText);
        
        // Then
        assertNotNull(textContent);
        assertEquals(10000, textContent.value().length());
    }

    @Test
    @DisplayName("Should reject text exceeding 10,000 characters")
    void shouldRejectTextExceedingMaxLength() {
        // Given
        String tooLongText = "A".repeat(10001);
        
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            new TextContent(tooLongText);
        }, "Text content cannot exceed 10,000 characters");
    }

    @Test
    @DisplayName("Should be immutable - value returns same instance")
    void shouldBeImmutable() {
        // Given
        String originalText = "Meditation text";
        TextContent textContent = new TextContent(originalText);
        
        // When
        String retrievedText1 = textContent.value();
        String retrievedText2 = textContent.value();
        
        // Then
        assertEquals(originalText, retrievedText1);
        assertEquals(originalText, retrievedText2);
    }

    @Test
    @DisplayName("Should implement value equality")
    void shouldImplementValueEquality() {
        // Given
        String text = "Meditation content";
        TextContent content1 = new TextContent(text);
        TextContent content2 = new TextContent(text);
        TextContent content3 = new TextContent("Different content");
        
        // Then
        assertEquals(content1, content2, "Same text should be equal");
        assertNotEquals(content1, content3, "Different text should not be equal");
        assertEquals(content1.hashCode(), content2.hashCode(), "Equal objects should have same hashCode");
    }

    @Test
    @DisplayName("Should have meaningful toString")
    void shouldHaveMeaningfulToString() {
        // Given
        String text = "Test meditation";
        TextContent textContent = new TextContent(text);
        
        // When
        String toString = textContent.toString();
        
        // Then
        assertNotNull(toString);
        assertTrue(toString.contains(text) || toString.contains("TextContent"), 
            "toString should contain text or class name");
    }
}
