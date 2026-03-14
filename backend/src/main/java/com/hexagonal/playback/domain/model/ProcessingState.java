package com.hexagonal.playback.domain.model;

/**
 * Represents the current processing state of a meditation generation.
 * Maps to user-friendly Spanish labels shown in the UI.
 * 
 * Business Rules:
 * - Only COMPLETED state allows playback
 * - State labels are shown to end users in Spanish
 * - State transitions are managed by meditation.generation BC (not playback)
 */
public enum ProcessingState {
    
    /**
     * Meditation queued for generation.
     * User-facing label: "En cola"
     */
    PENDING("En cola"),
    
    /**
     * Meditation currently being generated.
     * User-facing label: "Generando"
     */
    PROCESSING("Generando"),
    
    /**
     * Meditation generation completed successfully.
     * User-facing label: "Completada"
     * Only this state allows playback.
     */
    COMPLETED("Completada"),
    
    /**
     * Meditation generation failed.
     * User-facing label: "Fallida"
     */
    FAILED("Fallida");

    private final String label;

    ProcessingState(String label) {
        this.label = label;
    }

    /**
     * Returns the user-friendly Spanish label for this state.
     * 
     * @return Spanish label (e.g., "En cola", "Generando", "Completada", "Fallida")
     */
    public String getLabel() {
        return label;
    }

    /**
     * Determines if a meditation in this state can be played.
     * 
     * Business Rule: Only COMPLETED meditations are playable.
     * 
     * @return true if state is COMPLETED, false otherwise
     */
    public boolean isPlayable() {
        return this == COMPLETED;
    }

    /**
     * Converts a string value to ProcessingState enum.
     * 
     * @param value String representation of the state (e.g., "COMPLETED")
     * @return ProcessingState enum if valid, null otherwise
     */
    public static ProcessingState fromValue(String value) {
        if (value == null) {
            return null;
        }
        
        for (ProcessingState state : values()) {
            if (state.name().equals(value)) {
                return state;
            }
        }
        
        return null;
    }
}
