package com.hexagonal.playback.domain.ports.in;

import com.hexagonal.playback.domain.model.Meditation;

import java.util.UUID;

/**
 * Use case port for retrieving playback information of a specific meditation.
 * This port validates that the meditation exists, belongs to the requesting user,
 * and is in a playable state.
 */
public interface GetPlaybackInfoUseCase {
    
    /**
     * Retrieves the playback information for a specific meditation.
     * Validates ownership and playability before returning the meditation details.
     *
     * @param meditationId the unique identifier of the meditation
     * @param userId the unique identifier of the user requesting playback
     * @return the meditation with playback information
     * @throws IllegalArgumentException if meditationId or userId is null
     * @throws com.hexagonal.playback.domain.exception.MeditationNotFoundException if meditation doesn't exist or doesn't belong to user
     * @throws com.hexagonal.playback.domain.exception.MeditationNotPlayableException if meditation is not in COMPLETED state
     */
    Meditation execute(UUID meditationId, UUID userId);
}
