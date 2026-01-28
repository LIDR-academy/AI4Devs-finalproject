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
 * - Immutable
 * - Presence of image determines output type (VIDEO vs PODCAST)
 * 
 * @author Meditation Builder Team
 */
public final class ImageReference {

    private final String value;

    /**
     * Creates a new ImageReference value object.
     * 
     * @param value the image identifier/reference (manual or AI-generated)
     * @throws IllegalArgumentException if value is null, empty, or blank
     */
    public ImageReference(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Image reference cannot be null");
        }
        if (value.isEmpty()) {
            throw new IllegalArgumentException("Image reference cannot be empty");
        }
        if (value.isBlank()) {
            throw new IllegalArgumentException("Image reference cannot be blank");
        }
        
        this.value = value;
    }

    /**
     * Returns the image reference value.
     * 
     * @return the image identifier
     */
    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ImageReference that = (ImageReference) o;
        return Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return "ImageReference{" +
                "value='" + value + '\'' +
                '}';
    }
}
