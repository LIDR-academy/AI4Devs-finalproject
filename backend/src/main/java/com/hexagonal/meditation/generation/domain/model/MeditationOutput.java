package com.hexagonal.meditation.generation.domain.model;

import com.hexagonal.meditation.generation.domain.enums.GenerationStatus;
import com.hexagonal.meditation.generation.domain.enums.MediaType;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

/**
 * Domain Aggregate representing generated meditation content.
 * Root entity for the Generation bounded context.
 * 
 * Encapsulates:
 * - Content snapshot (text, music, optional image)
 * - Generation output (media URLs, subtitles, duration)
 * - Processing status and timestamps
 * 
 * Domain Layer - BC: Generation
 * Immutable aggregate root with factories (Java 21).
 */
public record MeditationOutput(
    UUID id,
    UUID compositionId,
    UUID userId,
    MediaType type,
    String textSnapshot,
    MediaReference musicReference,
    MediaReference imageReference,
    String idempotencyKey,
    String mediaUrl,
    String subtitleUrl,
    Integer durationSeconds,
    GenerationStatus status,
    Instant createdAt,
    Instant updatedAt
) {
    
    /**
     * Compact constructor with validation.
     */
    public MeditationOutput {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        if (compositionId == null) {
            throw new IllegalArgumentException("Composition ID cannot be null");
        }
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (type == null) {
            throw new IllegalArgumentException("Media type cannot be null");
        }
        if (textSnapshot == null || textSnapshot.isBlank()) {
            throw new IllegalArgumentException("Text snapshot cannot be null or blank");
        }
        if (musicReference == null) {
            throw new IllegalArgumentException("Music reference cannot be null");
        }
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("Idempotency key cannot be null or blank");
        }
        if (status == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }
        if (createdAt == null) {
            throw new IllegalArgumentException("Created at cannot be null");
        }
        if (updatedAt == null) {
            throw new IllegalArgumentException("Updated at cannot be null");
        }
        
        // Business rule: VIDEO requires image
        if (type == MediaType.VIDEO && imageReference == null) {
            throw new IllegalArgumentException("VIDEO type requires an image reference");
        }
    }

    /**
     * Factory method: Create audio meditation (no image).
     * 
     * @param compositionId source composition ID
     * @param userId user ID
     * @param textSnapshot meditation text
     * @param musicReference music reference
     * @param idempotencyKey unique key for deduplication
     * @param clock clock for timestamps
     * @return new MeditationOutput in PROCESSING status
     */
    public static MeditationOutput createAudio(
        UUID compositionId,
        UUID userId,
        String textSnapshot,
        MediaReference musicReference,
        String idempotencyKey,
        Clock clock
    ) {
        Instant now = clock.instant();
        return new MeditationOutput(
            UUID.randomUUID(),
            compositionId,
            userId,
            MediaType.AUDIO,
            textSnapshot,
            musicReference,
            null, // no image
            idempotencyKey,
            null, // media URL set after generation
            null, // subtitle URL set after generation
            null, // duration set after generation
            GenerationStatus.PROCESSING,
            now,
            now
        );
    }

    /**
     * Factory method: Create video meditation (with image).
     * 
     * @param compositionId source composition ID
     * @param userId user ID
     * @param textSnapshot meditation text
     * @param musicReference music reference
     * @param imageReference image reference
     * @param idempotencyKey unique key for deduplication
     * @param clock clock for timestamps
     * @return new MeditationOutput in PROCESSING status
     */
    public static MeditationOutput createVideo(
        UUID compositionId,
        UUID userId,
        String textSnapshot,
        MediaReference musicReference,
        MediaReference imageReference,
        String idempotencyKey,
        Clock clock
    ) {
        Instant now = clock.instant();
        return new MeditationOutput(
            UUID.randomUUID(),
            compositionId,
            userId,
            MediaType.VIDEO,
            textSnapshot,
            musicReference,
            imageReference, // image present
            idempotencyKey,
            null, // media URL set after generation
            null, // subtitle URL set after generation
            null, // duration set after generation
            GenerationStatus.PROCESSING,
            now,
            now
        );
    }

    /**
     * Mark generation as completed with media URLs and duration.
     * 
     * @param mediaUrl presigned S3 URL for media file
     * @param subtitleUrl presigned S3 URL for subtitle file
     * @param durationSeconds total duration in seconds
     * @param clock clock for updated timestamp
     * @return new MeditationOutput with COMPLETED status
     */
    public MeditationOutput markCompleted(
        String mediaUrl,
        String subtitleUrl,
        int durationSeconds,
        Clock clock
    ) {
        return new MeditationOutput(
            this.id,
            this.compositionId,
            this.userId,
            this.type,
            this.textSnapshot,
            this.musicReference,
            this.imageReference,
            this.idempotencyKey,
            mediaUrl,
            subtitleUrl,
            durationSeconds,
            GenerationStatus.COMPLETED,
            this.createdAt,
            clock.instant()
        );
    }

    /**
     * Mark generation as failed.
     * 
     * @param clock clock for updated timestamp
     * @return new MeditationOutput with FAILED status
     */
    public MeditationOutput markFailed(Clock clock) {
        return new MeditationOutput(
            this.id,
            this.compositionId,
            this.userId,
            this.type,
            this.textSnapshot,
            this.musicReference,
            this.imageReference,
            this.idempotencyKey,
            this.mediaUrl,
            this.subtitleUrl,
            this.durationSeconds,
            GenerationStatus.FAILED,
            this.createdAt,
            clock.instant()
        );
    }

    /**
     * Mark generation as timed out.
     * 
     * @param clock clock for updated timestamp
     * @return new MeditationOutput with TIMEOUT status
     */
    public MeditationOutput markTimeout(Clock clock) {
        return new MeditationOutput(
            this.id,
            this.compositionId,
            this.userId,
            this.type,
            this.textSnapshot,
            this.musicReference,
            this.imageReference,
            this.idempotencyKey,
            this.mediaUrl,
            this.subtitleUrl,
            this.durationSeconds,
            GenerationStatus.TIMEOUT,
            this.createdAt,
            clock.instant()
        );
    }

    /**
     * Check if generation is complete.
     * 
     * @return true if status is COMPLETED
     */
    public boolean isCompleted() {
        return status == GenerationStatus.COMPLETED;
    }

    /**
     * Check if generation is still processing.
     * 
     * @return true if status is PROCESSING
     */
    public boolean isProcessing() {
        return status == GenerationStatus.PROCESSING;
    }

    /**
     * Check if generation failed.
     * 
     * @return true if status is FAILED or TIMEOUT
     */
    public boolean hasFailed() {
        return status == GenerationStatus.FAILED || status == GenerationStatus.TIMEOUT;
    }
}
