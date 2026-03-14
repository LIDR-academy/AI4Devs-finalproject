package com.hexagonal.meditationbuilder.domain.model;

import java.util.Objects;

/**
 * MusicReference Value Object.
 * 
 * Represents a reference to background music from the media catalog.
 * 
 * Business Rules:
 * - Music is OPTIONAL in a composition
 * - When provided, reference must be valid (not null, not empty, not blank)
 * - Immutable (record)
 * 
 * @author Meditation Builder Team
 */
public record MusicReference(String value) {

    /**
     * Compact constructor with validation.
     * 
     * @throws IllegalArgumentException if value is null, empty, or blank
     */
    public MusicReference {
        Objects.requireNonNull(value, "Music reference cannot be null");
        
        if (value.isEmpty()) {
            throw new IllegalArgumentException("Music reference cannot be empty");
        }
        if (value.isBlank()) {
            throw new IllegalArgumentException("Music reference cannot be blank");
        }
    }
}
