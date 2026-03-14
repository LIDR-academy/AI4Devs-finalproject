package com.hexagonal.meditation.generation.domain.exception;

/**
 * Domain exception for invalid content.
 * Thrown when meditation content fails validation or is rejected by external services.
 * 
 * Domain Layer - BC: Generation
 * Maps to HTTP 400 Bad Request in controllers.
 */
public class InvalidContentException extends RuntimeException {

    private final String fieldName;

    /**
     * Create exception with field name and message.
     * 
     * @param fieldName name of invalid field
     * @param message validation error message
     */
    public InvalidContentException(String fieldName, String message) {
        super(String.format("Invalid content in field '%s': %s", fieldName, message));
        this.fieldName = fieldName;
    }

    /**
     * Create exception with message only.
     * 
     * @param message validation error message
     */
    public InvalidContentException(String message) {
        super(message);
        this.fieldName = null;
    }

    /**
     * Create exception with message and cause.
     * 
     * @param message validation error message
     * @param cause underlying cause
     */
    public InvalidContentException(String message, Throwable cause) {
        super(message, cause);
        this.fieldName = null;
    }

    public String getFieldName() {
        return fieldName;
    }
}
