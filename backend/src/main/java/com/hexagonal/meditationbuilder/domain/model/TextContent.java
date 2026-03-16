package com.hexagonal.meditationbuilder.domain.model;

import java.util.Objects;

/**
 * TextContent Value Object.
 * 
 * Represents meditation text content with strict invariants:
 * - Text is mandatory (not null, not empty)
 * - Text is preserved EXACTLY as provided (no trimming, no normalization)
 * - Maximum length: 10,000 characters
 * - Immutable (record)
 * 
 * Domain Rules (from BDD Scenario 2):
 * "text is captured and preserved exactly"
 * 
 * @author Meditation Builder Team
 */
public record TextContent(String value) {

    private static final int MAX_LENGTH = 10000;

    /**
     * Compact constructor with validation.
     * Preserves text EXACTLY as provided (no trim, no normalization).
     * 
     * @throws IllegalArgumentException if value is null, empty, blank, or exceeds max length
     */
    public TextContent {
        Objects.requireNonNull(value, "Text content cannot be null");
        
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
        // CRITICAL: value is assigned automatically by record, preserved EXACTLY
    }

    /**
     * Returns the length of the text content.
     * 
     * @return character count
     */
    public int length() {
        return value.length();
    }
}
