package com.hexagonal.meditationbuilder.domain.model;

import java.util.Objects;

/**
 * ImageReference Value Object.
 * 
 * Represents a reference to an image (manual or AI-generated).
 * 
 * Business Rules:
 * - Image is OPTIONAL in a composition
 * - When provided, reference must be valid (not null, not empty, not blank)
 * - Can be manual selection or AI-generated
 * - Immutable (record)
 * - Presence of image determines output type (VIDEO vs PODCAST)
 * 
 * @author Meditation Builder Team
 */
public record ImageReference(String value) {

    /**
     * Compact constructor with validation.
     * 
     * @throws IllegalArgumentException if value is null, empty, or blank
     */
    public ImageReference {
        Objects.requireNonNull(value, "Image reference cannot be null");
        
        if (value.isEmpty()) {
            throw new IllegalArgumentException("Image reference cannot be empty");
        }
        if (value.isBlank()) {
            throw new IllegalArgumentException("Image reference cannot be blank");
        }
    }
}
