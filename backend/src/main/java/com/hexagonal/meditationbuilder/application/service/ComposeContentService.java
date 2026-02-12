package com.hexagonal.meditationbuilder.application.service;

import com.hexagonal.meditationbuilder.domain.enums.OutputType;
import com.hexagonal.meditationbuilder.domain.exception.CompositionNotFoundException;
import com.hexagonal.meditationbuilder.domain.exception.MusicNotFoundException;
import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.domain.model.MeditationComposition;
import com.hexagonal.meditationbuilder.domain.model.MusicReference;
import com.hexagonal.meditationbuilder.domain.model.TextContent;
import com.hexagonal.meditationbuilder.domain.ports.in.ComposeContentUseCase;
import com.hexagonal.meditationbuilder.domain.ports.out.CompositionRepositoryPort;
import com.hexagonal.meditationbuilder.domain.ports.out.MediaCatalogPort;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.observation.annotation.Observed;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

import java.time.Clock;
import java.util.Objects;
import java.util.UUID;

/**
 * ComposeContentService - Application service implementing ComposeContentUseCase.
 * 
 * Orchestrates domain objects and out ports for composition operations.
 * Contains NO business logic - only orchestration.
 * 
 * Follows hexagonal architecture:
 * - Depends on domain ports (CompositionRepositoryPort, MediaCatalogPort)
 * - Throws domain exceptions (CompositionNotFoundException, MusicNotFoundException)
 * - No infrastructure dependencies
 * 
 * Responsibilities:
 * - Coordinate domain operations
 * - Validate music exists via MediaCatalogPort
 * - Persist compositions via CompositionRepositoryPort
 * - Handle not-found scenarios with domain exceptions
 */
public class ComposeContentService implements ComposeContentUseCase {

    private static final Logger logger = LoggerFactory.getLogger(ComposeContentService.class);

    private final MediaCatalogPort mediaCatalogPort;
    private final CompositionRepositoryPort compositionRepositoryPort;
    private final Clock clock;
    private final MeterRegistry meterRegistry;

    /**
     * Constructor with explicit Clock and MeterRegistry for testability.
     */
    public ComposeContentService(
            MediaCatalogPort mediaCatalogPort,
            CompositionRepositoryPort compositionRepositoryPort,
            Clock clock,
            MeterRegistry meterRegistry) {
        this.mediaCatalogPort = Objects.requireNonNull(mediaCatalogPort, "mediaCatalogPort is required");
        this.compositionRepositoryPort = Objects.requireNonNull(compositionRepositoryPort, "compositionRepositoryPort is required");
        this.clock = Objects.requireNonNull(clock, "clock is required");
        this.meterRegistry = Objects.requireNonNull(meterRegistry, "meterRegistry is required");
    }

    /**
     * Constructor with default UTC clock.
     */
    public ComposeContentService(
            MediaCatalogPort mediaCatalogPort,
            CompositionRepositoryPort compositionRepositoryPort,
            MeterRegistry meterRegistry) {
        this(mediaCatalogPort, compositionRepositoryPort, Clock.systemUTC(), meterRegistry);
    }

    @Override
    @Observed(name = "composition.create", contextualName = "create-composition")
    public MeditationComposition createComposition(TextContent textContent) {
        if (textContent == null) {
            throw new IllegalArgumentException("text content is required");
        }
        
        MeditationComposition composition = MeditationComposition.create(textContent, clock);
        MeditationComposition saved = compositionRepositoryPort.save(composition);
        
        // Add compositionId to MDC for correlation
        MDC.put("compositionId", saved.id().toString());
        try {
            logger.info("composition.created: compositionId={}, outputType={}", 
                saved.id(), saved.outputType());
            
            // Increment counter metric
            Counter.builder("meditation.composition.created")
                    .tag("output_type", saved.outputType().name())
                    .register(meterRegistry)
                    .increment();
        } finally {
            MDC.remove("compositionId");
        }
        
        return saved;
    }

    @Override
    @Observed(name = "composition.update-text", contextualName = "update-composition-text")
    public MeditationComposition updateText(UUID compositionId, TextContent newTextContent) {
        Objects.requireNonNull(compositionId, "compositionId is required");
        Objects.requireNonNull(newTextContent, "newTextContent is required");
        
        MeditationComposition composition = findCompositionOrThrow(compositionId);
        MeditationComposition updated = composition.withText(newTextContent, clock);
        MeditationComposition saved = compositionRepositoryPort.save(updated);
        
        // Add compositionId to MDC for correlation
        MDC.put("compositionId", compositionId.toString());
        try {
            logger.info("composition.text.updated: compositionId={}, textLength={}", 
                compositionId, newTextContent.value().length());
        } finally {
            MDC.remove("compositionId");
        }
        
        return saved;
    }

    @Override
    @Observed(name = "composition.select-music", contextualName = "select-composition-music")
    public MeditationComposition selectMusic(UUID compositionId, MusicReference musicReference) {
        Objects.requireNonNull(compositionId, "compositionId is required");
        Objects.requireNonNull(musicReference, "musicReference is required");
        
        MeditationComposition composition = findCompositionOrThrow(compositionId);
        
        // Validate music exists in catalog
        MDC.put("compositionId", compositionId.toString());
        try {
            if (!mediaCatalogPort.musicExists(musicReference)) {
                logger.warn("composition.music.not_found: compositionId={}, musicId={}", 
                    compositionId, musicReference.value());
                throw new MusicNotFoundException(musicReference.value());
            }
            
            MeditationComposition updated = composition.withMusic(musicReference, clock);
            MeditationComposition saved = compositionRepositoryPort.save(updated);
            
            logger.info("composition.music.selected: compositionId={}, musicId={}", 
                compositionId, musicReference.value());
            
            return saved;
        } finally {
            MDC.remove("compositionId");
        }
    }

    @Override
    @Observed(name = "composition.set-image", contextualName = "set-composition-image")
    public MeditationComposition setImage(UUID compositionId, ImageReference imageReference) {
        Objects.requireNonNull(compositionId, "compositionId is required");
        Objects.requireNonNull(imageReference, "imageReference is required");
        
        MeditationComposition composition = findCompositionOrThrow(compositionId);
        MeditationComposition updated = composition.withImage(imageReference, clock);
        MeditationComposition saved = compositionRepositoryPort.save(updated);
        
        // Add compositionId to MDC for correlation
        MDC.put("compositionId", compositionId.toString());
        try {
            logger.info("composition.image.set: compositionId={}, outputType={}", 
                compositionId, saved.outputType());
        } finally {
            MDC.remove("compositionId");
        }
        
        return saved;
    }

    @Override
    public MeditationComposition removeImage(UUID compositionId) {
        Objects.requireNonNull(compositionId, "compositionId is required");
        
        MeditationComposition composition = findCompositionOrThrow(compositionId);
        MeditationComposition updated = composition.withoutImage(clock);
        return compositionRepositoryPort.save(updated);
    }

    @Override
    public MeditationComposition getComposition(UUID compositionId) {
        Objects.requireNonNull(compositionId, "compositionId is required");
        return findCompositionOrThrow(compositionId);
    }

    @Override
    public OutputType getOutputType(UUID compositionId) {
        Objects.requireNonNull(compositionId, "compositionId is required");
        MeditationComposition composition = findCompositionOrThrow(compositionId);
        return composition.outputType();
    }

    private MeditationComposition findCompositionOrThrow(UUID compositionId) {
        return compositionRepositoryPort.findById(compositionId)
                .orElseThrow(() -> new com.hexagonal.meditationbuilder.domain.exception.CompositionNotFoundException(compositionId));
    }
}
