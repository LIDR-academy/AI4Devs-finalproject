package com.hexagonal.playback.domain.ports.in;

import com.hexagonal.playback.domain.model.Meditation;

import java.util.List;
import java.util.UUID;

/**
 * Use case port for listing meditations belonging to a specific user.
 * This port defines the contract for retrieving all meditations created by a user,
 * typically ordered by creation date.
 */
public interface ListMeditationsUseCase {
    
    /**
     * Lists all meditations created by the specified user.
     *
     * @param userId the unique identifier of the user
     * @return a list of meditations belonging to the user, never null (empty list if no meditations found)
     * @throws IllegalArgumentException if userId is null
     */
    List<Meditation> execute(UUID userId);
}
