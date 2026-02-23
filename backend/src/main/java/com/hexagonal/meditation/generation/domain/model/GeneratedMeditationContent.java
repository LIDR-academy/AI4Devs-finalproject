package com.hexagonal.meditation.generation.domain.model;

import com.hexagonal.meditation.generation.domain.enums.GenerationStatus;
import com.hexagonal.meditation.generation.domain.enums.MediaType;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

/**
 * Domain Aggregate for generated meditation audio/video content.
 * Bounded Context: Generation (US3)
 * 
 * This represents the result of generating audio/video from narration, music, and optional image.
 * Separate from MeditationOutput (Composition BC / US2).
 */
public record GeneratedMeditationContent(
    UUID meditationId,
    UUID compositionId,
    UUID userId,
    String idempotencyKey,
    MediaType mediaType,
    GenerationStatus status,
    NarrationScript narrationScript,
    MediaReference outputMedia,
    MediaReference subtitleFile,
    MediaReference backgroundImage,
    MediaReference backgroundMusic,
    Integer durationSeconds,
    String errorMessage,
    Instant createdAt,
    Instant completedAt
) {
    
    /**
     * Compact constructor with validation.
     */
    public GeneratedMeditationContent {
        if (meditationId == null) {
            throw new IllegalArgumentException("Meditation ID cannot be null");
        }
        if (compositionId == null) {
            throw new IllegalArgumentException("Composition ID cannot be null");
        }
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("Idempotency key cannot be null or blank");
        }
        if (mediaType == null) {
            throw new IllegalArgumentException("Media type cannot be null");
        }
        if (status == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }
        if (narrationScript == null) {
            throw new IllegalArgumentException("Narration script cannot be null");
        }
        if (createdAt == null) {
            throw new IllegalArgumentException("Created at cannot be null");
        }
        
        // Business rule: VIDEO requires background image
        if (mediaType == MediaType.VIDEO && backgroundImage == null) {
            throw new IllegalArgumentException("VIDEO type requires a background image");
        }
    }
    
    /**
     * Factory method: Create audio generation request.
     */
    public static GeneratedMeditationContent createAudio(
        UUID meditationId,
        UUID compositionId,
        UUID userId,
        String idempotencyKey,
        NarrationScript narrationScript,
        Clock clock
    ) {
        return new GeneratedMeditationContent(
            meditationId,
            compositionId,
            userId,
            idempotencyKey,
            MediaType.AUDIO,
            GenerationStatus.PROCESSING,
            narrationScript,
            null,
            null,
            null,
            null,
            null,
            null,
            clock.instant(),
            null
        );
    }
    
    /**
     * Factory method: Create video generation request.
     */
    public static GeneratedMeditationContent createVideo(
        UUID meditationId,
        UUID compositionId,
        UUID userId,
        String idempotencyKey,
        NarrationScript narrationScript,
        MediaReference backgroundImage,
        Clock clock
    ) {
        return new GeneratedMeditationContent(
            meditationId,
            compositionId,
            userId,
            idempotencyKey,
            MediaType.VIDEO,
            GenerationStatus.PROCESSING,
            narrationScript,
            null,
            null,
            backgroundImage,
            null,
            null,
            null,
            clock.instant(),
            null
        );
    }
    
    /**
     * Mark generation as completed successfully.
     */
    public GeneratedMeditationContent markCompleted(
        MediaReference outputMedia,
        MediaReference subtitleFile,
        Integer durationSeconds,
        Clock clock
    ) {
        return new GeneratedMeditationContent(
            meditationId,
            compositionId,
            userId,
            idempotencyKey,
            mediaType,
            GenerationStatus.COMPLETED,
            narrationScript,
            outputMedia,
            subtitleFile,
            backgroundImage,
            backgroundMusic,
            durationSeconds,
            null,
            createdAt,
            clock.instant()
        );
    }
    
    /**
     * Mark generation as failed.
     */
    public GeneratedMeditationContent markFailed(String errorMessage, Clock clock) {
        return new GeneratedMeditationContent(
            meditationId,
            compositionId,
            userId,
            idempotencyKey,
            mediaType,
            GenerationStatus.FAILED,
            narrationScript,
            outputMedia,
            subtitleFile,
            backgroundImage,
            backgroundMusic,
            durationSeconds,
            errorMessage,
            createdAt,
            clock.instant()
        );
    }
    
    /**
     * Mark generation as timed out.
     */
    public GeneratedMeditationContent markTimeout(String errorMessage, Clock clock) {
        return new GeneratedMeditationContent(
            meditationId,
            compositionId,
            userId,
            idempotencyKey,
            mediaType,
            GenerationStatus.TIMEOUT,
            narrationScript,
            outputMedia,
            subtitleFile,
            backgroundImage,
            backgroundMusic,
            durationSeconds,
            errorMessage,
            createdAt,
            clock.instant()
        );
    }
    
    /**
     * Add background music reference.
     */
    public GeneratedMeditationContent withBackgroundMusic(MediaReference musicReference) {
        return new GeneratedMeditationContent(
            meditationId,
            compositionId,
            userId,
            idempotencyKey,
            mediaType,
            status,
            narrationScript,
            outputMedia,
            subtitleFile,
            backgroundImage,
            musicReference,
            durationSeconds,
            errorMessage,
            createdAt,
            completedAt
        );
    }
}
