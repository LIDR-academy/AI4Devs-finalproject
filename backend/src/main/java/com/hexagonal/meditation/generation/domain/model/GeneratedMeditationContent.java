package com.hexagonal.meditation.generation.domain.model;

import com.hexagonal.meditation.generation.domain.enums.GenerationStatus;
import com.hexagonal.meditation.generation.domain.enums.MediaType;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
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
    Optional<MediaReference> outputMedia,
    Optional<MediaReference> subtitleFile,
    Optional<MediaReference> backgroundImage,
    Optional<MediaReference> backgroundMusic,
    Optional<String> errorMessage,
    Instant createdAt,
    Optional<Instant> completedAt
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
        if (outputMedia == null) {
            throw new IllegalArgumentException("Output media Optional cannot be null");
        }
        if (subtitleFile == null) {
            throw new IllegalArgumentException("Subtitle file Optional cannot be null");
        }
        if (backgroundImage == null) {
            throw new IllegalArgumentException("Background image Optional cannot be null");
        }
        if (backgroundMusic == null) {
            throw new IllegalArgumentException("Background music Optional cannot be null");
        }
        if (errorMessage == null) {
            throw new IllegalArgumentException("Error message Optional cannot be null");
        }
        if (createdAt == null) {
            throw new IllegalArgumentException("Created at cannot be null");
        }
        if (completedAt == null) {
            throw new IllegalArgumentException("Completed at Optional cannot be null");
        }
        
        // Business rule: VIDEO requires background image
        if (mediaType == MediaType.VIDEO && backgroundImage.isEmpty()) {
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
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            clock.instant(),
            Optional.empty()
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
            Optional.empty(),
            Optional.empty(),
            Optional.of(backgroundImage),
            Optional.empty(),
            Optional.empty(),
            clock.instant(),
            Optional.empty()
        );
    }
    
    /**
     * Mark generation as completed successfully.
     */
    public GeneratedMeditationContent markCompleted(
        MediaReference outputMedia,
        MediaReference subtitleFile,
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
            Optional.of(outputMedia),
            Optional.of(subtitleFile),
            backgroundImage,
            backgroundMusic,
            Optional.empty(),
            createdAt,
            Optional.of(clock.instant())
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
            Optional.of(errorMessage),
            createdAt,
            Optional.of(clock.instant())
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
            Optional.of(errorMessage),
            createdAt,
            Optional.of(clock.instant())
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
            Optional.of(musicReference),
            errorMessage,
            createdAt,
            completedAt
        );
    }
}
