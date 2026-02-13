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
     * Checks if reference is an S3 URL.
     * 
     * @return true if reference starts with s3://
     */
    public boolean isS3() {
        return reference.startsWith("s3://");
    }

    /**
     * Gets the URL/reference string.
     * 
     * @return the reference string
     */
    public String url() {
        return reference;
    }

    /**
     * Checks if reference is a local path.
     * 
     * @return true if reference does not start with http(s):// or s3://
     */
    public boolean isLocalPath() {
        return !isUrl() && !isS3();
    }
}
