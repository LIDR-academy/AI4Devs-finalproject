package com.hexagonal.playback.infrastructure.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for MeditationEntity.
 * Provides query methods for accessing generation.meditation_output table (READ-ONLY).
 * 
 * Ordering and filtering are defined by method names using Spring Data JPA conventions.
 */
@Repository
public interface PostgreSqlMeditationRepository extends JpaRepository<MeditationEntity, UUID> {

    /**
     * Finds all meditations for a specific user, ordered by creation date descending (newest first).
     * 
     * @param userId the user ID to filter by
     * @return list of meditation entities ordered by createdAt DESC
     */
    List<MeditationEntity> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    /**
     * Finds a meditation by its ID and user ID.
     * Ensures that the meditation exists and belongs to the specified user.
     * 
     * @param meditationId the meditation ID
     * @param userId the user ID
     * @return Optional containing the meditation if found and owned by user, empty otherwise
     */
    Optional<MeditationEntity> findByMeditationIdAndUserId(UUID meditationId, UUID userId);
}
