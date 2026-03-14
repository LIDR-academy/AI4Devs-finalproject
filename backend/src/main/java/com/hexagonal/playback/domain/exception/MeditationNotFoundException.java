package com.hexagonal.playback.domain.exception;

import java.util.UUID;

/**
 * Domain exception thrown when a meditation is not found or doesn't belong to the user.
 * Maps to HTTP 404 Not Found in controllers.
 */
public class MeditationNotFoundException extends RuntimeException {

    private final UUID meditationId;
    private final UUID userId;

    /**
     * Creates exception with meditation ID only.
     * 
     * @param meditationId ID of the meditation that was not found
     */
    public MeditationNotFoundException(UUID meditationId) {
        super("Meditation not found with id: " + meditationId);
        this.meditationId = meditationId;
        this.userId = null;
    }

    /**
     * Creates exception with both meditation ID and user ID.
     * 
     * @param meditationId ID of the meditation that was not found
     * @param userId ID of the user who tried to access it
     */
    public MeditationNotFoundException(UUID meditationId, UUID userId) {
        super("Meditation not found with id: " + meditationId + " for user: " + userId);
        this.meditationId = meditationId;
        this.userId = userId;
    }

    public UUID getMeditationId() {
        return meditationId;
    }

    public UUID getUserId() {
        return userId;
    }
}
