package com.hexagonal.meditationbuilder.domain.exception;

/**
 * Exception thrown when image generation fails.
 */
public class ImageGenerationException extends RuntimeException {
    
    public ImageGenerationException(String message) {
        super(message);
    }
    
    public ImageGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}
