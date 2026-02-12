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
    MeditationOutput generate(GenerationRequest request);

    /**
     * Request object for meditation generation (domain layer).
     */
    record GenerationRequest(
        java.util.UUID compositionId,
        String userId,
        String text,
        String musicReference,
        java.util.Optional<String> imageReference
    ) {
        public GenerationRequest {
            if (compositionId == null) {
                throw new IllegalArgumentException("Composition ID cannot be null");
            }
            if (userId == null || userId.isBlank()) {
                throw new IllegalArgumentException("User ID cannot be null or blank");
            }
            if (text == null || text.isBlank()) {
                throw new IllegalArgumentException("Text cannot be null or blank");
            }
            if (musicReference == null || musicReference.isBlank()) {
                throw new IllegalArgumentException("Music reference cannot be null or blank");
            }
            if (imageReference == null) {
                throw new IllegalArgumentException("Image reference Optional cannot be null");
            }
        }
    }
}
