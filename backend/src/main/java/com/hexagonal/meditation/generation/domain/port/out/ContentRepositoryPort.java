package com.hexagonal.meditation.generation.domain.port.out;

import com.hexagonal.meditation.generation.domain.model.GeneratedMeditationContent;

import java.util.Optional;
import java.util.UUID;

/**
 * Port for meditation content repository (database persistence).
 * Handles storage and retrieval of meditation generation results.
 */
public interface ContentRepositoryPort {
    
    /**
     * Save generated meditation content to repository.
     * 
     * @param content generated content to save
     * @return saved content with any generated fields
     */
    GeneratedMeditationContent save(GeneratedMeditationContent content);
    
    /**
     * Find generated content by ID.
     * 
     * @param meditationId meditation ID to find
     * @return Optional containing found content or empty
     */
    Optional<GeneratedMeditationContent> findById(UUID meditationId);
    
    /**
     * Find generated content by idempotency key.
     * Used for request deduplication.
     * 
     * @param idempotencyKey idempotency key to find
     * @return Optional containing found content or empty
     */
    Optional<GeneratedMeditationContent> findByIdempotencyKey(String idempotencyKey);
    
    /**
     * Delete generated content from repository.
     * 
     * @param meditationId meditation ID to delete
     */
    void delete(UUID meditationId);
}
