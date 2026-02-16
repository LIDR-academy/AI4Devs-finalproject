package com.hexagonal.playback.domain.exception;

import com.hexagonal.playback.domain.model.ProcessingState;

import java.util.UUID;

/**
 * Domain exception thrown when attempting to play a meditation that is not in COMPLETED state.
 * Maps to HTTP 409 Conflict in controllers.
 */
public class MeditationNotPlayableException extends RuntimeException {

    private final UUID meditationId;
    private final ProcessingState currentState;

    /**
     * Creates exception with meditation ID and current state.
     * 
     * @param meditationId ID of the meditation that cannot be played
     * @param currentState Current processing state (not COMPLETED)
     */
    public MeditationNotPlayableException(UUID meditationId, ProcessingState currentState) {
        super("Meditation " + meditationId + " is not playable. Current state: " + currentState.getLabel());
        this.meditationId = meditationId;
        this.currentState = currentState;
    }

    /**
     * Returns user-friendly error message in Spanish.
     * 
     * @return Spanish error message for end users
     */
    public String getUserMessage() {
        return "Esta meditación aún se está procesando. Por favor, espera a que esté lista.";
    }

    public UUID getMeditationId() {
        return meditationId;
    }

    public ProcessingState getCurrentState() {
        return currentState;
    }
}
