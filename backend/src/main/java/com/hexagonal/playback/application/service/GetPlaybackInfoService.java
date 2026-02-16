package com.hexagonal.playback.application.service;

import com.hexagonal.playback.domain.exception.MeditationNotFoundException;
import com.hexagonal.playback.domain.model.Meditation;
import com.hexagonal.playback.domain.ports.in.GetPlaybackInfoUseCase;
import com.hexagonal.playback.domain.ports.out.MeditationRepositoryPort;

import java.util.Objects;
import java.util.UUID;

/**
 * Application service that orchestrates the retrieval of playback information for a meditation.
 * This service validates that the meditation exists, belongs to the user, and is in a playable state.
 * Playability validation is delegated to the PlaybackValidator.
 */
public class GetPlaybackInfoService implements GetPlaybackInfoUseCase {

    private final MeditationRepositoryPort meditationRepositoryPort;
    private final PlaybackValidator playbackValidator;

    public GetPlaybackInfoService(
        MeditationRepositoryPort meditationRepositoryPort,
        PlaybackValidator playbackValidator
    ) {
        this.meditationRepositoryPort = Objects.requireNonNull(meditationRepositoryPort, "meditationRepositoryPort cannot be null");
        this.playbackValidator = Objects.requireNonNull(playbackValidator, "playbackValidator cannot be null");
    }

    @Override
    public Meditation execute(UUID meditationId, UUID userId) {
        if (meditationId == null) {
            throw new IllegalArgumentException("meditationId cannot be null");
        }
        if (userId == null) {
            throw new IllegalArgumentException("userId cannot be null");
        }

        Meditation meditation = meditationRepositoryPort
            .findByIdAndUserId(meditationId, userId)
            .orElseThrow(() -> new MeditationNotFoundException(meditationId, userId));

        playbackValidator.validatePlayable(meditation);

        return meditation;
    }
}
