package com.hexagonal.meditation.generation.application.service;

import com.hexagonal.meditation.generation.application.validator.TextLengthEstimator;
import com.hexagonal.meditation.generation.domain.enums.MediaType;
import com.hexagonal.meditation.generation.domain.exception.GenerationTimeoutException;
import com.hexagonal.meditation.generation.domain.exception.InvalidContentException;
import com.hexagonal.meditation.generation.domain.model.*;
import com.hexagonal.meditation.generation.domain.ports.in.GenerateMeditationContentUseCase;
import com.hexagonal.meditation.generation.domain.ports.out.*;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Application service that orchestrates meditation content generation.
 * Implements the hexagonal architecture use case pattern.
 */
public class GenerateMeditationContentService implements GenerateMeditationContentUseCase {
    
    private static final int MAX_GENERATION_TIMEOUT_SECONDS = 180; // 3 minutes
    
    private final TextLengthEstimator textLengthEstimator;
    private final IdempotencyKeyGenerator idempotencyKeyGenerator;
    private final VoiceSynthesisPort voiceSynthesisPort;
    private final SubtitleSyncPort subtitleSyncPort;
    private final AudioRenderingPort audioRenderingPort;
    private final VideoRenderingPort videoRenderingPort;
    private final MediaStoragePort mediaStoragePort;
    private final ContentRepositoryPort contentRepositoryPort;
    private final Clock clock;
    
    public GenerateMeditationContentService(
            TextLengthEstimator textLengthEstimator,
            IdempotencyKeyGenerator idempotencyKeyGenerator,
            VoiceSynthesisPort voiceSynthesisPort,
            SubtitleSyncPort subtitleSyncPort,
            AudioRenderingPort audioRenderingPort,
            VideoRenderingPort videoRenderingPort,
            MediaStoragePort mediaStoragePort,
            ContentRepositoryPort contentRepositoryPort,
            Clock clock) {
        this.textLengthEstimator = textLengthEstimator;
        this.idempotencyKeyGenerator = idempotencyKeyGenerator;
        this.voiceSynthesisPort = voiceSynthesisPort;
        this.subtitleSyncPort = subtitleSyncPort;
        this.audioRenderingPort = audioRenderingPort;
        this.videoRenderingPort = videoRenderingPort;
        this.mediaStoragePort = mediaStoragePort;
        this.contentRepositoryPort = contentRepositoryPort;
        this.clock = clock;
    }
    
    @Override
    public GenerationResponse generate(GenerationRequest request) {
        // 1. Validate input and estimate duration
        int estimatedDuration = textLengthEstimator.validateAndEstimate(request.narrationText());
        
        if (estimatedDuration > MAX_GENERATION_TIMEOUT_SECONDS) {
            throw new GenerationTimeoutException(estimatedDuration, MAX_GENERATION_TIMEOUT_SECONDS);
        }
        
        // 2. Check idempotency - return existing result if found
        String idempotencyKey = idempotencyKeyGenerator.generate(
            request.userId(),
            request.narrationText(),
            request.musicReference(),
            request.imageReference()
        );
        
        Optional<MeditationOutput> existing = contentRepositoryPort.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            return mapToResponse(existing.get());
        }
        
        // 3. Create domain aggregate based on media type
        MediaType mediaType = request.imageReference() != null ? MediaType.VIDEO : MediaType.AUDIO;
        MeditationOutput output = createDomainAggregate(request, mediaType, idempotencyKey);
        
        // 4. Save initial state (PROCESSING)
        MeditationOutput saved = contentRepositoryPort.save(output);
        
        // 5. Return immediate response with PROCESSING status
        return mapToResponse(saved);
    }
    
    /**
     * Creates the domain aggregate for the meditation output.
     * Validates that video requests include an image reference.
     */
    private MeditationOutput createDomainAggregate(
            GenerationRequest request,
            MediaType mediaType,
            String idempotencyKey) {
        
        NarrationScript narrationScript = new NarrationScript(request.narrationText());
        MediaReference musicReference = new MediaReference(request.musicReference());
        
        if (mediaType == MediaType.VIDEO) {
            if (request.imageReference() == null || request.imageReference().isBlank()) {
                throw new InvalidContentException("Image reference required for video generation", "imageReference");
            }
            
            MediaReference imageMediaReference = new MediaReference(request.imageReference());
            
            return MeditationOutput.createVideo(
                request.compositionId(),
                request.userId().toString(),
                narrationScript.text(),
                musicReference,
                imageMediaReference,
                idempotencyKey,
                clock
            );
        } else {
            return MeditationOutput.createAudio(
                request.compositionId(),
                request.userId().toString(),
                narrationScript.text(),
                musicReference,
                idempotencyKey,
                clock
            );
        }
    }
    
    /**
     * Maps domain aggregate to response DTO.
     */
    private GenerationResponse mapToResponse(MeditationOutput output) {
        // completedAt is updatedAt when status is COMPLETED
        Optional<Instant> completedAt = output.status() == com.hexagonal.meditation.generation.domain.enums.GenerationStatus.COMPLETED
            ? Optional.of(output.updatedAt())
            : Optional.empty();
        
        return new GenerationResponse(
            output.id(),
            output.compositionId(),
            UUID.fromString(output.userId()),
            output.status(),
            output.type(),
            output.mediaUrl(),
            output.subtitleUrl(),
            output.durationSeconds(),
            output.createdAt(),
            completedAt
        );
    }
}
