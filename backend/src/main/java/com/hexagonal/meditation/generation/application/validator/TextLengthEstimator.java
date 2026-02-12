package com.hexagonal.meditation.generation.application.validator;

import com.hexagonal.meditation.generation.domain.exception.InvalidContentException;

/**
 * Validates and estimates the duration of narration text.
 * Uses a heuristic of ~150 words per minute (average narration speed).
 */
public class TextLengthEstimator {
    
    private static final int WORDS_PER_MINUTE = 150;
    private static final int MINIMUM_DURATION_SECONDS = 30;
    private static final String TEXT_FIELD = "narrationText";
    
    /**
     * Validates that the estimated narration duration meets minimum requirements.
     * 
     * @param text The narration text to validate
     * @return The estimated duration in seconds
     * @throws InvalidContentException if text is too short (< 30 seconds estimated)
     */
    public int validateAndEstimate(String text) {
        if (text == null || text.isBlank()) {
            throw new InvalidContentException(TEXT_FIELD, "Text cannot be empty");
        }
        
        int estimatedSeconds = estimateDuration(text);
        
        if (estimatedSeconds < MINIMUM_DURATION_SECONDS) {
            throw new InvalidContentException(
                TEXT_FIELD,
                String.format("Text too short: estimated %d seconds, minimum %d seconds required", 
                    estimatedSeconds, MINIMUM_DURATION_SECONDS)
            );
        }
        
        return estimatedSeconds;
    }
    
    /**
     * Estimates the narration duration based on word count.
     * Uses ~150 words per minute as average narration speed.
     * 
     * @param text The text to analyze
     * @return Estimated duration in seconds
     */
    public int estimateDuration(String text) {
        if (text == null || text.isBlank()) {
            return 0;
        }
        
        String trimmed = text.trim();
        int wordCount = countWords(trimmed);
        
        // Convert words to seconds: (words / words_per_minute) * 60
        return Math.max(1, (wordCount * 60) / WORDS_PER_MINUTE);
    }
    
    /**
     * Counts words in text by splitting on whitespace.
     * 
     * @param text The text to count
     * @return Number of words
     */
    private int countWords(String text) {
        if (text.isEmpty()) {
            return 0;
        }
        
        // Split on whitespace (spaces, tabs, newlines)
        String[] words = text.split("\\s+");
        
        // Filter out empty strings
        return (int) java.util.Arrays.stream(words)
            .filter(word -> !word.isEmpty())
            .count();
    }
}
