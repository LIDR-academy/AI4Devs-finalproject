package com.hexagonal.meditation.generation.infrastructure.config;

import com.hexagonal.meditation.generation.application.service.GenerateMeditationContentService;
import com.hexagonal.meditation.generation.application.service.IdempotencyKeyGenerator;
import com.hexagonal.meditation.generation.application.validator.TextLengthEstimator;
import com.hexagonal.meditation.generation.domain.ports.in.GenerateMeditationContentUseCase;
import com.hexagonal.meditation.generation.domain.ports.out.AudioRenderingPort;
import com.hexagonal.meditation.generation.domain.ports.out.ContentRepositoryPort;
import com.hexagonal.meditation.generation.domain.ports.out.MediaStoragePort;
import com.hexagonal.meditation.generation.domain.ports.out.SubtitleSyncPort;
import com.hexagonal.meditation.generation.domain.ports.out.VideoRenderingPort;
import com.hexagonal.meditation.generation.domain.ports.out.VoiceSynthesisPort;
import com.hexagonal.meditation.generation.infrastructure.out.service.audio.AudioMetadataService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

/**
 * Spring configuration for Generation bounded context.
 * Wires domain use cases with infrastructure adapters.
 * 
 * Bounded Context: Generation (US3 - Generate Meditation Audio/Video)
 * 
 * Architecture: Hexagonal (Ports & Adapters)
 * - Use cases (application layer) depend on ports (interfaces)
 * - Infrastructure adapters implement the ports
 * - Configuration wires everything together via dependency injection
 */
@Configuration
public class GenerationConfig {

    /**
     * Main use case bean for meditation content generation.
     * Orchestrates the entire generation flow: TTS → subtitles → rendering → storage.
     * 
     * @param textLengthEstimator validates text length and estimates processing time
     * @param idempotencyKeyGenerator generates unique keys for deduplication
     * @param voiceSynthesisPort out port for TTS (Google Cloud TTS adapter)
     * @param subtitleSyncPort out port for subtitle generation (SRT adapter)
     * @param audioRenderingPort out port for audio mixing (FFmpeg adapter)
     * @param videoRenderingPort out port for video rendering (FFmpeg adapter)
     * @param mediaStoragePort out port for S3 storage (AWS S3/LocalStack adapter)
     * @param contentRepositoryPort out port for persistence (JPA adapter)
     * @param audioMetadataService service for analyzing audio file metadata (duration, bitrate, etc.)
     * @param clock system clock for timestamps (UTC)
     * @return configured use case instance
     */
    @Bean
    public GenerateMeditationContentUseCase generateMeditationContentUseCase(
            TextLengthEstimator textLengthEstimator,
            IdempotencyKeyGenerator idempotencyKeyGenerator,
            VoiceSynthesisPort voiceSynthesisPort,
            SubtitleSyncPort subtitleSyncPort,
            AudioRenderingPort audioRenderingPort,
            VideoRenderingPort videoRenderingPort,
            MediaStoragePort mediaStoragePort,
            ContentRepositoryPort contentRepositoryPort,
            AudioMetadataService audioMetadataService,
            Clock clock) {
        return new GenerateMeditationContentService(
                textLengthEstimator,
                idempotencyKeyGenerator,
                voiceSynthesisPort,
                subtitleSyncPort,
                audioRenderingPort,
                videoRenderingPort,
                mediaStoragePort,
                contentRepositoryPort,
                audioMetadataService,
                clock
        );
    }

    /**
     * Text length validator and duration estimator.
     * Validates text constraints and estimates processing time.
     */
    @Bean
    public TextLengthEstimator textLengthEstimator() {
        return new TextLengthEstimator();
    }

    /**
     * Idempotency key generator for content deduplication.
     * Uses SHA-256 hash of (userId, text, musicRef, imageRef).
     */
    @Bean
    public IdempotencyKeyGenerator idempotencyKeyGenerator() {
        return new IdempotencyKeyGenerator();
    }
}
