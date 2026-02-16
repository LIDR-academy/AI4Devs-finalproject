package com.hexagonal.playback.application.service;

import com.hexagonal.playback.domain.model.Meditation;
import com.hexagonal.playback.domain.ports.in.ListMeditationsUseCase;
import com.hexagonal.playback.domain.ports.out.MeditationRepositoryPort;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Application service that orchestrates the listing of meditations for a user.
 * This service delegates to the repository port for data retrieval.
 * Ordering by creation date (DESC) is handled by the repository implementation.
 */
public class ListMeditationsService implements ListMeditationsUseCase {

    private final MeditationRepositoryPort meditationRepositoryPort;

    public ListMeditationsService(MeditationRepositoryPort meditationRepositoryPort) {
        this.meditationRepositoryPort = Objects.requireNonNull(meditationRepositoryPort, "meditationRepositoryPort cannot be null");
    }

    @Override
    public List<Meditation> execute(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("userId cannot be null");
        }

        return meditationRepositoryPort.findAllByUserId(userId);
    }
}
