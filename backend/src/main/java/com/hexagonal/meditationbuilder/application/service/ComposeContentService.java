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

    private final MediaCatalogPort mediaCatalogPort;
    private final CompositionRepositoryPort compositionRepositoryPort;
    private final Clock clock;

    /**
     * Constructor with explicit Clock for testability.
     */
    public ComposeContentService(
            MediaCatalogPort mediaCatalogPort,
            CompositionRepositoryPort compositionRepositoryPort,
            Clock clock) {
        this.mediaCatalogPort = Objects.requireNonNull(mediaCatalogPort, "mediaCatalogPort is required");
        this.compositionRepositoryPort = Objects.requireNonNull(compositionRepositoryPort, "compositionRepositoryPort is required");
        this.clock = Objects.requireNonNull(clock, "clock is required");
    }

    /**
     * Constructor with default UTC clock.
     */
    public ComposeContentService(
            MediaCatalogPort mediaCatalogPort,
            CompositionRepositoryPort compositionRepositoryPort) {
        this(mediaCatalogPort, compositionRepositoryPort, Clock.systemUTC());
    }

    @Override
    public MeditationComposition createComposition(TextContent textContent) {
        if (textContent == null) {
            throw new IllegalArgumentException("text content is required");
        }
        
        MeditationComposition composition = MeditationComposition.create(textContent, clock);
        return compositionRepositoryPort.save(composition);
    }

    @Override
    public MeditationComposition updateText(UUID compositionId, TextContent newTextContent) {
        Objects.requireNonNull(compositionId, "compositionId is required");
        Objects.requireNonNull(newTextContent, "newTextContent is required");
        
        MeditationComposition composition = findCompositionOrThrow(compositionId);
        MeditationComposition updated = composition.withText(newTextContent, clock);
        return compositionRepositoryPort.save(updated);
    }

    @Override
    public MeditationComposition selectMusic(UUID compositionId, MusicReference musicReference) {
        Objects.requireNonNull(compositionId, "compositionId is required");
        Objects.requireNonNull(musicReference, "musicReference is required");
        
        MeditationComposition composition = findCompositionOrThrow(compositionId);
        
        // Validate music exists in catalog
        if (!mediaCatalogPort.musicExists(musicReference)) {
            throw new MusicNotFoundException(musicReference.value());
        }
        
        MeditationComposition updated = composition.withMusic(musicReference, clock);
        return compositionRepositoryPort.save(updated);
    }

    @Override
    public MeditationComposition setImage(UUID compositionId, ImageReference imageReference) {
        Objects.requireNonNull(compositionId, "compositionId is required");
        Objects.requireNonNull(imageReference, "imageReference is required");
        
        MeditationComposition composition = findCompositionOrThrow(compositionId);
        MeditationComposition updated = composition.withImage(imageReference, clock);
        return compositionRepositoryPort.save(updated);
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
