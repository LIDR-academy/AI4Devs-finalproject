package com.hexagonal.meditation.generation.application.service;

import com.hexagonal.meditation.generation.application.validator.TextLengthEstimator;
import com.hexagonal.meditation.generation.domain.enums.MediaType;
import com.hexagonal.meditation.generation.domain.exception.GenerationTimeoutException;
import com.hexagonal.meditation.generation.domain.exception.InvalidContentException;
import com.hexagonal.meditation.generation.domain.model.GeneratedMeditationContent;
import com.hexagonal.meditation.generation.domain.model.MediaReference;
import com.hexagonal.meditation.generation.domain.model.NarrationScript;
import com.hexagonal.meditation.generation.domain.ports.in.GenerateMeditationContentUseCase;
import com.hexagonal.meditation.generation.domain.ports.in.GenerateMeditationContentUseCase.GenerationRequest;
import com.hexagonal.meditation.generation.domain.ports.in.GenerateMeditationContentUseCase.GenerationResponse;
import com.hexagonal.meditation.generation.domain.ports.out.AudioRenderingPort;
import com.hexagonal.meditation.generation.domain.ports.out.ContentRepositoryPort;
import com.hexagonal.meditation.generation.domain.ports.out.MediaStoragePort;
import com.hexagonal.meditation.generation.domain.ports.out.SubtitleSyncPort;
import com.hexagonal.meditation.generation.domain.ports.out.VideoRenderingPort;
import com.hexagonal.meditation.generation.domain.ports.out.VoiceSynthesisPort;

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
        
        Optional<GeneratedMeditationContent> existing = contentRepositoryPort.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            return mapToResponse(existing.get());
        }
        
        // 3. Create domain aggregate based on media type
        MediaType mediaType = request.imageReference() != null ? MediaType.VIDEO : MediaType.AUDIO;
        GeneratedMeditationContent output = createDomainAggregate(request, mediaType, idempotencyKey);
        
        // 4. Save initial state (PROCESSING)
        GeneratedMeditationContent saved = contentRepositoryPort.save(output);
        
        // 5. Return immediate response with PROCESSING status
        return mapToResponse(saved);
    }
    
    /**
     * Creates the domain aggregate for the meditation output.
     * Validates that video requests include an image reference.
     */
    private GeneratedMeditationContent createDomainAggregate(
            GenerationRequest request,
            MediaType mediaType,
            String idempotencyKey) {
        
        NarrationScript narrationScript = new NarrationScript(request.narrationText());
        UUID meditationId = UUID.randomUUID();
        
        if (mediaType == MediaType.VIDEO) {
            if (request.imageReference() == null || request.imageReference().isBlank()) {
                throw new InvalidContentException("imageReference", "Image reference required for video generation");
            }
            
            MediaReference imageMediaReference = new MediaReference(request.imageReference());
            
            return GeneratedMeditationContent.createVideo(
                meditationId,
                request.compositionId(),
                request.userId(),
                idempotencyKey,
                narrationScript,
                imageMediaReference,
                clock
            );
        } else {
            return GeneratedMeditationContent.createAudio(
                meditationId,
                request.compositionId(),
                request.userId(),
                idempotencyKey,
                narrationScript,
                clock
            );
        }
    }
    
    /**
     * Maps domain aggregate to response DTO.
     */
    private GenerationResponse mapToResponse(GeneratedMeditationContent content) {
        return new GenerationResponse(
            content.meditationId(),
            content.compositionId(),
            content.userId(),
            content.status(),
            content.mediaType(),
            content.outputMedia().map(MediaReference::url),
            content.subtitleFile().map(MediaReference::url),
            Optional.of((int) content.narrationScript().estimateDurationSeconds()),
            content.createdAt(),
            content.completedAt()
        );
    }
}
