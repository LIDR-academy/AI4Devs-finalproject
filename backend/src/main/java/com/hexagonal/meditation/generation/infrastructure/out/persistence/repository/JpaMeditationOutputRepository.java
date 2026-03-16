package com.hexagonal.meditation.generation.infrastructure.out.persistence.repository;

import com.hexagonal.meditation.generation.infrastructure.out.persistence.entity.MeditationOutputEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for MeditationOutputEntity.
 */
@Repository
public interface JpaMeditationOutputRepository extends JpaRepository<MeditationOutputEntity, UUID> {
    
    /**
     * Find meditation output by idempotency key.
     * Used for deduplication of generation requests.
     * 
     * @param idempotencyKey unique hash of request parameters
     * @return Optional containing found entity or empty
     */
    Optional<MeditationOutputEntity> findByIdempotencyKey(String idempotencyKey);
    
    /**
     * Find all meditation outputs created by a specific user.
     * 
     * @param userId the user ID
     * @return list of meditation outputs for the user
     */
    java.util.List<MeditationOutputEntity> findByUserId(UUID userId);
    
    /**
     * Check if meditation output exists with given idempotency key.
     * 
     * @param idempotencyKey unique hash of request parameters
     * @return true if exists, false otherwise
     */
    boolean existsByIdempotencyKey(String idempotencyKey);
}
