package com.hexagonal.meditationbuilder.domain.ports.in;

import com.hexagonal.meditationbuilder.domain.model.ImageReference;

/**
 * GenerateImageUseCase - Inbound Port.
 * 
 * Defines operations for AI-powered image generation.
 * 
 * Use Cases (from BDD Scenario 4):
 * - Generate image from prompt using AI
 * 
 * @author Meditation Builder Team
 */
public interface GenerateImageUseCase {

    /**
     * Generates an image from a prompt using AI.
     * 
     * Business Rule: AI generates image based on user prompt.
     * Result is a reference to the generated image.
     * 
     * @param prompt user prompt describing desired image
     * @return reference to AI-generated image
     * @throws IllegalArgumentException if prompt is null or empty
     * @throws ImageGenerationException if AI generation fails
     */
    ImageReference generateImage(String prompt);

    /**
     * Exception thrown when image generation fails.
     */
    class ImageGenerationException extends RuntimeException {
        public ImageGenerationException(String message, Throwable cause) {
            super(message, cause);
        }
        
        public ImageGenerationException(String message) {
            super(message);
        }
    }
}
