package com.hexagonal.meditation.generation.infrastructure.out.persistence;

import com.hexagonal.meditation.generation.domain.model.GeneratedMeditationContent;
import com.hexagonal.meditation.generation.domain.port.out.ContentRepositoryPort;
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
    public Optional<GeneratedMeditationContent> findByIdempotencyKey(String idempotencyKey) {
        logger.debug("Finding meditation output by idempotency key: {}", idempotencyKey);
        
        return jpaRepository.findByIdempotencyKey(idempotencyKey)
            .map(mapper::toDomain);
    }
    
    @Override
    public void delete(UUID meditationId) {
        logger.info("Deleting meditation output: {}", meditationId);
        
        jpaRepository.deleteById(meditationId);
        
        logger.debug("Meditation output deleted successfully: {}", meditationId);
    }
}
