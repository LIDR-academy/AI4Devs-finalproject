package com.hexagonal.meditationbuilder.domain.ports.out;

import com.hexagonal.meditationbuilder.domain.model.ImageReference;

/**
 * ImageGenerationPort - Outbound Port.
 * 
 * Defines operations for external AI image generation service.
 * 
 * Use Cases:
 * - Call AI service to generate image from prompt
 * 
 * Implementation will be provided by infrastructure adapters (e.g., DALL-E, Stable Diffusion).
 * 
 * @author Meditation Builder Team
 */
public interface ImageGenerationPort {

    /**
     * Generates an image using external AI service.
     * 
     * @param prompt user prompt describing desired image
     * @return reference to generated image
     * @throws IllegalArgumentException if prompt is null or empty
     * @throws ImageGenerationServiceException if external service fails
     */
    ImageReference generate(String prompt);

    /**
     * Exception thrown when external image generation service fails.
     */
    class ImageGenerationServiceException extends RuntimeException {
        public ImageGenerationServiceException(String message, Throwable cause) {
            super(message, cause);
        }
        
        public ImageGenerationServiceException(String message) {
            super(message);
        }
    }
}
