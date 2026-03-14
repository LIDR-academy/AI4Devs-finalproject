package com.hexagonal.meditationbuilder.domain.ports.out;

import com.hexagonal.meditationbuilder.domain.model.TextContent;

/**
 * TextGenerationPort - Outbound Port.
 * 
 * Defines operations for external AI text generation service.
 * 
 * Use Cases:
 * - Call AI service to generate text from prompt
 * - Call AI service to enhance existing text
 * 
 * Implementation will be provided by infrastructure adapters (e.g., OpenAI, Azure OpenAI).
 * 
 * @author Meditation Builder Team
 */
public interface TextGenerationPort {

    /**
     * Generates/Enhances text using external AI service.
     * 
     * @param prompt user prompt describing desired content
     * @return AI-generated text content
     * @throws IllegalArgumentException if prompt is null or empty
     * @throws TextGenerationServiceException if external service fails
     */
    TextContent generate(String prompt);

    /**
     * Exception thrown when external text generation service fails.
     */
    class TextGenerationServiceException extends RuntimeException {
        public TextGenerationServiceException(String message, Throwable cause) {
            super(message, cause);
        }
        
        public TextGenerationServiceException(String message) {
            super(message);
        }
    }
}
