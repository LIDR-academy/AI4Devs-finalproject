package com.hexagonal.meditation.generation.domain.model;

import com.hexagonal.meditation.generation.domain.enums.GenerationStatus;
import com.hexagonal.meditation.generation.domain.enums.MediaType;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
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
    String userId,
    MediaType type,
    String textSnapshot,
    MediaReference musicReference,
    Optional<MediaReference> imageReference,
    Optional<String> mediaUrl,
    Optional<String> subtitleUrl,
    Optional<Integer> durationSeconds,
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
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("User ID cannot be null or blank");
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
        if (imageReference == null) {
            throw new IllegalArgumentException("Image reference Optional cannot be null");
        }
        if (mediaUrl == null) {
            throw new IllegalArgumentException("Media URL Optional cannot be null");
        }
        if (subtitleUrl == null) {
            throw new IllegalArgumentException("Subtitle URL Optional cannot be null");
        }
        if (durationSeconds == null) {
            throw new IllegalArgumentException("Duration seconds Optional cannot be null");
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
        if (type == MediaType.VIDEO && imageReference.isEmpty()) {
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
     * @param clock clock for timestamps
     * @return new MeditationOutput in PROCESSING status
     */
    public static MeditationOutput createAudio(
        UUID compositionId,
        String userId,
        String textSnapshot,
        MediaReference musicReference,
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
            Optional.empty(), // no image
            Optional.empty(), // media URL set after generation
            Optional.empty(), // subtitle URL set after generation
            Optional.empty(), // duration set after generation
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
     * @param clock clock for timestamps
     * @return new MeditationOutput in PROCESSING status
     */
    public static MeditationOutput createVideo(
        UUID compositionId,
        String userId,
        String textSnapshot,
        MediaReference musicReference,
        MediaReference imageReference,
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
            Optional.of(imageReference), // image present
            Optional.empty(), // media URL set after generation
            Optional.empty(), // subtitle URL set after generation
            Optional.empty(), // duration set after generation
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
            Optional.of(mediaUrl),
            Optional.of(subtitleUrl),
            Optional.of(durationSeconds),
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
