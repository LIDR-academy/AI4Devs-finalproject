package com.hexagonal.meditation.generation.domain.ports.in;

import com.hexagonal.meditation.generation.domain.model.MeditationOutput;

/**
 * Input port (use case) for generating meditation content.
 * Defines the contract for the core business capability of the Generation BC.
 * 
 * Hexagonal Architecture - Driving Port (Application Core → Domain)
 * BC: Generation
 * 
 * Orchestrates:
 * 1. Text validation and processing time estimation
 * 2. Voice synthesis (TTS)
 * 3. Subtitle synchronization
 * 4. Audio/Video rendering
 * 5. Media storage (S3)
 * 6. Persistence
 */
public interface GenerateMeditationContentUseCase {

    /**
     * Generate meditation content with narration and synchronized subtitles.
     * 
     * @param request generation request (domain object)
     * @return generated meditation output with media URLs
     * @throws com.hexagonal.meditation.generation.domain.exception.GenerationTimeoutException if processing time exceeds threshold
     * @throws com.hexagonal.meditation.generation.domain.exception.InvalidContentException if content validation fails
     */
    GenerationResponse generate(GenerationRequest request);

    /**
     * Request object for meditation generation (domain layer).
     */
    record GenerationRequest(
        java.util.UUID compositionId,
        java.util.UUID userId,
        String narrationText,
        String musicReference,
        String imageReference
    ) {
        public GenerationRequest {
            if (compositionId == null) {
                throw new IllegalArgumentException("Composition ID cannot be null");
            }
            if (userId == null) {
                throw new IllegalArgumentException("User ID cannot be null");
            }
            if (narrationText == null || narrationText.isBlank()) {
                throw new IllegalArgumentException("Narration text cannot be null or blank");
            }
            if (musicReference == null || musicReference.isBlank()) {
                throw new IllegalArgumentException("Music reference cannot be null or blank");
            }
            // imageReference can be null for audio-only generation
        }
    }
    
    /**
     * Response object for meditation generation (domain layer).
     */
    record GenerationResponse(
        java.util.UUID id,
        java.util.UUID compositionId,
        java.util.UUID userId,
        com.hexagonal.meditation.generation.domain.enums.GenerationStatus status,
        com.hexagonal.meditation.generation.domain.enums.MediaType mediaType,
        java.util.Optional<String> mediaUrl,
        java.util.Optional<String> subtitleUrl,
        java.util.Optional<Integer> durationSeconds,
        java.time.Instant createdAt,
        java.util.Optional<java.time.Instant> completedAt
    ) {}
}
