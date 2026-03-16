package com.hexagonal.meditationbuilder.domain.ports.out;

import com.hexagonal.meditationbuilder.domain.model.MeditationComposition;

import java.util.Optional;
import java.util.UUID;

/**
 * CompositionRepositoryPort - Outbound Port for composition persistence.
 * 
 * Defines operations for storing and retrieving MeditationComposition aggregates.
 * Implementation will be provided by infrastructure layer (e.g., MongoDB, PostgreSQL).
 * 
 * This is a domain port, not an application-level interface.
 * The domain defines WHAT persistence operations are needed,
 * infrastructure defines HOW they are implemented.
 * 
 * @author Meditation Builder Team
 */
public interface CompositionRepositoryPort {

    /**
     * Persists a composition.
     * 
     * @param composition the composition to persist
     * @return the persisted composition (may include generated fields)
     * @throws IllegalArgumentException if composition is null
     */
    MeditationComposition save(MeditationComposition composition);

    /**
     * Finds a composition by its unique identifier.
     * 
     * @param id the composition UUID
     * @return the composition if found, empty otherwise
     * @throws IllegalArgumentException if id is null
     */
    Optional<MeditationComposition> findById(UUID id);

    /**
     * Deletes a composition by its unique identifier.
     * 
     * @param id the composition UUID
     * @throws IllegalArgumentException if id is null
     */
    void deleteById(UUID id);

    /**
     * Checks if a composition exists.
     * 
     * @param id the composition UUID
     * @return true if composition exists, false otherwise
     * @throws IllegalArgumentException if id is null
     */
    boolean existsById(UUID id);
}
