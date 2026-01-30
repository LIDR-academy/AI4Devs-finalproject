package com.hexagonal.meditationbuilder.domain.exception;

/**
 * Exception thrown when text generation service is unavailable.
 */
public class TextGenerationServiceException extends RuntimeException {
    
    public TextGenerationServiceException(String message) {
        super(message);
    }
    
    public TextGenerationServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
