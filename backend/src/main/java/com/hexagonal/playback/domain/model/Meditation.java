package com.hexagonal.playback.domain.model;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

/**
 * Meditation Aggregate Root.
 * Represents a generated meditation with its processing state and media URLs.
 * 
 * Business Rules:
 * - A meditation belongs to exactly one user (isolation via userId)
 * - Only COMPLETED meditations can be played
 * - COMPLETED meditations must have mediaUrls
 * - CreatedAt cannot be in the future
 * 
 * Immutability: Java 21 record ensures all fields are final
 * 
 * @param id Unique meditation identifier (UUID)
 * @param userId Owner of the meditation (UUID)
 * @param title Meditation title
 * @param createdAt Creation timestamp
 * @param processingState Current processing state
 * @param mediaUrls Media URLs for playback (null if not COMPLETED)
 */
public record Meditation(
    UUID id,
    UUID userId,
    String title,
    Instant createdAt,
    ProcessingState processingState,
    MediaUrls mediaUrls
) {
    
    /**
     * Compact constructor with validation.
     * Uses system clock for validation.
     * 
     * @throws IllegalArgumentException if business rules are violated
     */
    public Meditation {
        validateInvariants(id, userId, title, createdAt, processingState, mediaUrls, Clock.systemUTC());
    }

    /**
     * Alternative constructor with injectable clock for testing.
     * 
     * @param id Meditation ID
     * @param userId Owner ID
     * @param title Meditation title
     * @param createdAt Creation timestamp
     * @param processingState Processing state
     * @param mediaUrls Media URLs
     * @param clock Clock for timestamp validation
     */
    public Meditation(
        UUID id,
        UUID userId,
        String title,
        Instant createdAt,
        ProcessingState processingState,
        MediaUrls mediaUrls,
        Clock clock
    ) {
        this(id, userId, title, createdAt, processingState, mediaUrls);
        validateInvariants(id, userId, title, createdAt, processingState, mediaUrls, clock);
    }

    /**
     * Validates all business rules and invariants.
     */
    private static void validateInvariants(
        UUID id,
        UUID userId,
        String title,
        Instant createdAt,
        ProcessingState processingState,
        MediaUrls mediaUrls,
        Clock clock
    ) {
        // Validate id
        if (id == null) {
            throw new IllegalArgumentException("Meditation id cannot be null");
        }
        
        // Validate userId
        if (userId == null) {
            throw new IllegalArgumentException("UserId cannot be null");
        }
        
        // Validate title
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Title cannot be null or empty");
        }
        
        // Validate createdAt
        if (createdAt == null) {
            throw new IllegalArgumentException("CreatedAt cannot be null");
        }
        
        if (createdAt.isAfter(Instant.now(clock))) {
            throw new IllegalArgumentException("CreatedAt cannot be in the future");
        }
        
        // Validate processingState
        if (processingState == null) {
            throw new IllegalArgumentException("ProcessingState cannot be null");
        }
        
        // Business Rule: COMPLETED state requires mediaUrls
        if (processingState == ProcessingState.COMPLETED && mediaUrls == null) {
            throw new IllegalArgumentException("MediaUrls are required for COMPLETED state");
        }
    }

    /**
     * Determines if this meditation can be played.
     * Delegates to ProcessingState.isPlayable().
     * 
     * Business Rule: Only COMPLETED meditations are playable.
     * 
     * @return true if meditation is in COMPLETED state, false otherwise
     */
    public boolean isPlayable() {
        return processingState.isPlayable();
    }

    /**
     * Checks if this meditation belongs to the specified user.
     * 
     * @param userId User ID to check ownership
     * @return true if meditation belongs to user, false otherwise
     */
    public boolean belongsTo(UUID userId) {
        return this.userId.equals(userId);
    }

    /**
     * Entity equality based on ID only (DDD pattern).
     * Two meditations are equal if they have the same ID.
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Meditation that = (Meditation) obj;
        return id.equals(that.id);
    }

    /**
     * Hash code based on ID only (DDD pattern).
     */
    @Override
    public int hashCode() {
        return id.hashCode();
    }
}
