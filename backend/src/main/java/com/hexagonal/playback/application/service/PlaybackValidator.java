package com.hexagonal.playback.application.service;

import com.hexagonal.playback.domain.exception.MeditationNotPlayableException;
import com.hexagonal.playback.domain.model.Meditation;

/**
 * Validator responsible for enforcing playback business rules.
 * This validator ensures that only meditations in COMPLETED state can be played.
 * The validation logic is delegated to the domain model's isPlayable() method.
 */
public class PlaybackValidator {

    /**
     * Validates that a meditation is in a playable state.
     * Uses the domain model's isPlayable() method to determine playability.
     *
     * @param meditation the meditation to validate
     * @throws IllegalArgumentException if meditation is null
     * @throws MeditationNotPlayableException if meditation is not in COMPLETED state
     */
    public void validatePlayable(Meditation meditation) {
        if (meditation == null) {
            throw new IllegalArgumentException("meditation cannot be null");
        }

        if (!meditation.isPlayable()) {
            throw new MeditationNotPlayableException(meditation.id(), meditation.processingState());
        }
    }
}
