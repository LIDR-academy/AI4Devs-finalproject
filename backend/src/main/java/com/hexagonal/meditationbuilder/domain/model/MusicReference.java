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
 * - Immutable
 * 
 * @author Meditation Builder Team
 */
public final class MusicReference {

    private final String value;

    /**
     * Creates a new MusicReference value object.
     * 
     * @param value the music identifier/reference
     * @throws IllegalArgumentException if value is null, empty, or blank
     */
    public MusicReference(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Music reference cannot be null");
        }
        if (value.isEmpty()) {
            throw new IllegalArgumentException("Music reference cannot be empty");
        }
        if (value.isBlank()) {
            throw new IllegalArgumentException("Music reference cannot be blank");
        }
        
        this.value = value;
    }

    /**
     * Returns the music reference value.
     * 
     * @return the music identifier
     */
    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MusicReference that = (MusicReference) o;
        return Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return "MusicReference{" +
                "value='" + value + '\'' +
                '}';
    }
}
