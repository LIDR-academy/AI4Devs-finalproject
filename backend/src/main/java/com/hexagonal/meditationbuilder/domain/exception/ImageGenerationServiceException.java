package com.hexagonal.meditationbuilder.domain.exception;

/**
 * Exception thrown when image generation service is unavailable.
 */
public class ImageGenerationServiceException extends RuntimeException {
    
    public ImageGenerationServiceException(String message) {
        super(message);
    }
    
    public ImageGenerationServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
