package com.hexagonal.meditation.generation.domain.model;

/**
 * Value Object representing a reference to media (music or image).
 * Encapsulates path or URL validation.
 * 
 * Domain Layer - BC: Generation
 * Immutable record with validation (Java 21).
 */
public record MediaReference(String reference) {
    
    /**
     * Compact constructor with validation.
     */
    public MediaReference {
        if (reference == null || reference.isBlank()) {
            throw new IllegalArgumentException("Media reference cannot be null or blank");
        }
        if (reference.length() > 500) {
            throw new IllegalArgumentException("Media reference exceeds maximum length of 500 characters");
        }
    }

    /**
     * Checks if reference is a URL.
     * 
     * @return true if reference starts with http:// or https://
     */
    public boolean isUrl() {
        return reference.startsWith("http://") || reference.startsWith("https://");
    }

    /**
     * Checks if reference is a local path.
     * 
     * @return true if reference does not start with http(s)://
     */
    public boolean isLocalPath() {
        return !isUrl();
    }
}
