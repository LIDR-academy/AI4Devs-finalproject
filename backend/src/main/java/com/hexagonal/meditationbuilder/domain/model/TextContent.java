package com.hexagonal.meditationbuilder.domain.model;

import java.util.Objects;

/**
 * TextContent Value Object.
 * 
 * Represents meditation text content with strict invariants:
 * - Text is mandatory (not null, not empty)
 * - Text is preserved EXACTLY as provided (no trimming, no normalization)
 * - Maximum length: 10,000 characters
 * - Immutable
 * 
 * Domain Rules (from BDD Scenario 2):
 * "text is captured and preserved exactly"
 * 
 * @author Meditation Builder Team
 */
public final class TextContent {

    private static final int MAX_LENGTH = 10000;
    
    private final String value;

    /**
     * Creates a new TextContent value object.
     * 
     * @param value the meditation text content
     * @throws IllegalArgumentException if value is null, empty, blank, or exceeds max length
     */
    public TextContent(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Text content cannot be null");
        }
        if (value.isEmpty()) {
            throw new IllegalArgumentException("Text content cannot be empty");
        }
        if (value.isBlank()) {
            throw new IllegalArgumentException("Text content cannot be blank");
        }
        if (value.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                String.format("Text content cannot exceed %d characters (current: %d)", 
                    MAX_LENGTH, value.length()));
        }
        
        // CRITICAL: Preserve text EXACTLY as provided (no trim, no normalization)
        this.value = value;
    }

    /**
     * Returns the text content value.
     * Text is preserved exactly as it was provided.
     * 
     * @return the meditation text content
     */
    public String getValue() {
        return value;
    }

    /**
     * Returns the length of the text content.
     * 
     * @return character count
     */
    public int length() {
        return value.length();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TextContent that = (TextContent) o;
        return Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return "TextContent{" +
                "value='" + value + '\'' +
                ", length=" + value.length() +
                '}';
    }
}
