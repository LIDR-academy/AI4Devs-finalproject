package com.hexagonal.meditation.generation.domain.model;

/**
 * Value Object representing meditation narration script.
 * Contains the raw text to be synthesized into speech.
 * 
 * Domain Layer - BC: Generation
 * Immutable record with validation (Java 21).
 */
public record NarrationScript(String text) {
    
    /**
     * Compact constructor with validation.
     */
    public NarrationScript {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Narration text cannot be null or blank");
        }
        if (text.length() > 10_000) {
            throw new IllegalArgumentException("Narration text exceeds maximum length of 10000 characters");
        }
    }

    /**
     * Estimates duration in seconds based on average speaking rate.
     * Assumes ~150 words per minute (conservative estimate for meditation).
     * 
     * @return estimated duration in seconds
     */
    public int estimateDurationSeconds() {
        int wordCount = text.split("\\s+").length;
        double wordsPerSecond = 150.0 / 60.0; // ~2.5 words/second
        return (int) Math.ceil(wordCount / wordsPerSecond);
    }
}
