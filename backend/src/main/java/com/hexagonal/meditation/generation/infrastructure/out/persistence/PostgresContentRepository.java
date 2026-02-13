package com.hexagonal.meditation.generation.infrastructure.out.persistence;

import com.hexagonal.meditation.generation.domain.model.GeneratedMeditationContent;
import com.hexagonal.meditation.generation.domain.ports.out.ContentRepositoryPort;
import com.hexagonal.meditation.generation.infrastructure.out.persistence.entity.MeditationOutputEntity;
import com.hexagonal.meditation.generation.infrastructure.out.persistence.mapper.MeditationOutputMapper;
import com.hexagonal.meditation.generation.infrastructure.out.persistence.repository.JpaMeditationOutputRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * PostgreSQL-based implementation of ContentRepositoryPort using Spring Data JPA.
 * Manages persistence of meditation generation results.
 */
@Repository
@Transactional
public class PostgresContentRepository implements ContentRepositoryPort {
    
    private static final Logger logger = LoggerFactory.getLogger(PostgresContentRepository.class);
    
    private final JpaMeditationOutputRepository jpaRepository;
    private final MeditationOutputMapper mapper;
    
    public PostgresContentRepository(JpaMeditationOutputRepository jpaRepository, 
                                     MeditationOutputMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }
    
    @Override
    public GeneratedMeditationContent save(GeneratedMeditationContent content) {
        logger.info("Saving meditation output: id={}, status={}", 
            content.meditationId(), content.status());

        MeditationOutputEntity entity = mapper.toEntity(content);

        // Log all media URLs before saving for debugging length issues
        logger.debug("Media URL lengths - output_media_url: {}, subtitle_url: {}, background_image_url: {}, background_music_url: {}",
            entity.getOutputMediaUrl() != null ? entity.getOutputMediaUrl().length() : 0,
            entity.getSubtitleUrl() != null ? entity.getSubtitleUrl().length() : 0,
            entity.getBackgroundImageUrl() != null ? entity.getBackgroundImageUrl().length() : 0,
            entity.getBackgroundMusicUrl() != null ? entity.getBackgroundMusicUrl().length() : 0);
        
        if (logger.isTraceEnabled()) {
            logger.trace("output_media_url: {}", entity.getOutputMediaUrl());
            logger.trace("subtitle_url: {}", entity.getSubtitleUrl());
            logger.trace("background_image_url: {}", entity.getBackgroundImageUrl());
            logger.trace("background_music_url: {}", entity.getBackgroundMusicUrl());
        }

        MeditationOutputEntity savedEntity = jpaRepository.save(entity);

        logger.debug("Meditation output saved successfully: {}", savedEntity.getMeditationId());
        return mapper.toDomain(savedEntity);
    }
    
    @Override
    public Optional<GeneratedMeditationContent> findById(UUID meditationId) {
        logger.debug("Finding meditation output by ID: {}", meditationId);
        
        return jpaRepository.findById(meditationId)
            .map(mapper::toDomain);
    }
    
    @Override
    public java.util.List<GeneratedMeditationContent> findByUserId(String userId) {
        logger.debug("Finding meditation outputs by userId: {}", userId);
        
        return jpaRepository.findByUserId(UUID.fromString(userId)).stream()
            .map(mapper::toDomain)
            .toList();
    }
    
    @Override
    public Optional<GeneratedMeditationContent> findByIdempotencyKey(String idempotencyKey) {
        logger.debug("Finding meditation output by idempotency key: {}", idempotencyKey);
        
        return jpaRepository.findByIdempotencyKey(idempotencyKey)
            .map(mapper::toDomain);
    }
}
