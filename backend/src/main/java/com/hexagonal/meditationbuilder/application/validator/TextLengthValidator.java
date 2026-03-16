package com.hexagonal.meditationbuilder.application.validator;

/**
 * TextLengthValidator - Validates meditation text length constraints.
 * 
 * Business Rule: Maximum text length is 10,000 characters.
 * This limit is based on edge cases defined in BDD scenarios.
 * 
 * This validator returns a ValidationResult instead of throwing exceptions,
 * following the principle of not using exceptions for business validation.
 */
public class TextLengthValidator {

    /**
     * Maximum allowed text length in characters.
     */
    public static final int MAX_LENGTH = 10_000;

    /**
     * Validates text length against the maximum limit.
     * 
     * @param text the text to validate (can be null)
     * @return ValidationResult indicating success or failure with message
     */
    public ValidationResult validate(String text) {
        if (text == null) {
            return ValidationResult.invalid("Text cannot be null");
        }
        
        if (text.length() > MAX_LENGTH) {
            return ValidationResult.invalid(
                String.format("Text exceeds maximum length of %d characters (current: %d)", 
                    MAX_LENGTH, text.length())
            );
        }
        
        return ValidationResult.valid();
    }

    /**
     * Returns the maximum allowed text length.
     * 
     * @return max length in characters
     */
    public int getMaxLength() {
        return MAX_LENGTH;
    }
}
