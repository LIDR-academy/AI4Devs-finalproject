package com.hexagonal.meditationbuilder.domain.exception;

import java.util.UUID;

/**
 * CompositionNotFoundException - Domain exception for composition not found.
 * 
 * Thrown when attempting to access a composition that doesn't exist.
 * This is a business rule violation: operations require existing compositions.
 */
public class CompositionNotFoundException extends RuntimeException {
    
    private final UUID compositionId;
    
    public CompositionNotFoundException(UUID compositionId) {
        super("Composition not found: " + compositionId);
        this.compositionId = compositionId;
    }
    
    public CompositionNotFoundException(UUID compositionId, Throwable cause) {
        super("Composition not found: " + compositionId, cause);
        this.compositionId = compositionId;
    }
    
    public UUID getCompositionId() {
        return compositionId;
    }
}
