package com.hexagonal.meditationbuilder.domain.exception;

/**
 * Exception thrown when text generation fails.
 */
public class TextGenerationException extends RuntimeException {
    
    public TextGenerationException(String message) {
        super(message);
    }
    
    public TextGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}
