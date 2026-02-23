package com.hexagonal.playback.infrastructure.out.persistence;

import com.hexagonal.playback.domain.model.Meditation;
import com.hexagonal.playback.domain.ports.out.MeditationRepositoryPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * PostgreSQL adapter implementing the MeditationRepositoryPort.
 * Delegates to Spring Data JPA repository and maps between entities and domain models.
 */
@Component
public class PostgreSqlMeditationRepositoryAdapter implements MeditationRepositoryPort {

    private final PostgreSqlMeditationRepository jpaRepository;
    private final EntityToDomainMapper mapper;

    public PostgreSqlMeditationRepositoryAdapter(
        PostgreSqlMeditationRepository jpaRepository,
        EntityToDomainMapper mapper
    ) {
        this.jpaRepository = Objects.requireNonNull(jpaRepository, "jpaRepository cannot be null");
        this.mapper = Objects.requireNonNull(mapper, "mapper cannot be null");
    }

    @Override
    public List<Meditation> findAllByUserId(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("userId cannot be null");
        }

        return jpaRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public Optional<Meditation> findByIdAndUserId(UUID meditationId, UUID userId) {
        if (meditationId == null) {
            throw new IllegalArgumentException("meditationId cannot be null");
        }
        if (userId == null) {
            throw new IllegalArgumentException("userId cannot be null");
        }

        return jpaRepository.findByMeditationIdAndUserId(meditationId, userId)
            .map(mapper::toDomain);
    }
}
