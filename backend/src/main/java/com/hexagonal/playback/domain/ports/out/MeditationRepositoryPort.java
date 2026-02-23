package com.hexagonal.playback.domain.ports.out;

import com.hexagonal.playback.domain.model.Meditation;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Output port for meditation repository operations.
 * This port defines the contract for accessing meditation data from the persistence layer.
 * Implementations should handle data retrieval from the underlying storage system.
 */
public interface MeditationRepositoryPort {
    
    /**
     * Finds all meditations belonging to a specific user.
     * Results should be ordered by creation date in descending order (newest first).
     *
     * @param userId the unique identifier of the user
     * @return a list of meditations belonging to the user, never null (empty list if no meditations found)
     * @throws IllegalArgumentException if userId is null
     */
    List<Meditation> findAllByUserId(UUID userId);
    
    /**
     * Finds a specific meditation by its ID and user ID.
     * This ensures that the meditation exists and belongs to the specified user.
     *
     * @param meditationId the unique identifier of the meditation
     * @param userId the unique identifier of the user
     * @return an Optional containing the meditation if found and owned by the user, empty otherwise
     * @throws IllegalArgumentException if meditationId or userId is null
     */
    Optional<Meditation> findByIdAndUserId(UUID meditationId, UUID userId);
}
