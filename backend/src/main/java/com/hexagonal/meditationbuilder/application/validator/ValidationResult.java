package com.hexagonal.meditationbuilder.application.validator;

import java.util.Objects;
import java.util.Optional;

/**
 * ValidationResult - Represents the result of a validation operation.
 * 
 * Immutable value object that encapsulates validation outcome.
 * Uses Optional for error message to avoid null checks.
 * 
 * @param isValid true if validation passed
 * @param errorMessage error message if validation failed (empty if valid)
 */
public record ValidationResult(
    boolean isValid,
    Optional<String> errorMessage
) {
    
    public ValidationResult {
        Objects.requireNonNull(errorMessage, "errorMessage Optional cannot be null");
    }
    
    /**
     * Creates a valid result.
     * 
     * @return ValidationResult indicating success
     */
    public static ValidationResult valid() {
        return new ValidationResult(true, Optional.empty());
    }
    
    /**
     * Creates an invalid result with error message.
     * 
     * @param message error description
     * @return ValidationResult indicating failure
     * @throws IllegalArgumentException if message is null or blank
     */
    public static ValidationResult invalid(String message) {
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("Error message cannot be null or blank");
        }
        return new ValidationResult(false, Optional.of(message));
    }
    
    /**
     * Checks if validation failed.
     * 
     * @return true if invalid
     */
    public boolean isInvalid() {
        return !isValid;
    }
}
