package com.hexagonal.meditationbuilder.domain.ports.in;

import com.hexagonal.meditationbuilder.domain.model.TextContent;

/**
 * GenerateTextUseCase - Inbound Port.
 * 
 * Defines operations for AI-powered text generation and enhancement.
 * 
 * Use Cases (from BDD Scenario 3):
 * - Generate text from prompt
 * - Enhance existing text
 * 
 * @author Meditation Builder Team
 */
public interface GenerateTextUseCase {

    /**
     * Generates meditation text from a prompt using AI.
     * 
     * Business Rule: AI generates text based on user prompt.
     * 
     * @param prompt user prompt describing desired meditation content
     * @return AI-generated text content
     * @throws IllegalArgumentException if prompt is null or empty
     * @throws TextGenerationException if AI generation fails
     */
    TextContent generateText(String prompt);

    /**
     * Exception thrown when text generation fails.
     */
    class TextGenerationException extends RuntimeException {
        public TextGenerationException(String message, Throwable cause) {
            super(message, cause);
        }
        
        public TextGenerationException(String message) {
            super(message);
        }
    }
}
