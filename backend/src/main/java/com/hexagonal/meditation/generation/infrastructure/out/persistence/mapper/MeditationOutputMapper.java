package com.hexagonal.meditation.generation.infrastructure.out.persistence.mapper;

import com.hexagonal.meditation.generation.domain.model.GeneratedMeditationContent;
import com.hexagonal.meditation.generation.domain.model.MediaReference;
import com.hexagonal.meditation.generation.domain.model.NarrationScript;
import com.hexagonal.meditation.generation.infrastructure.out.persistence.entity.MeditationOutputEntity;
import org.springframework.stereotype.Component;

/**
 * Mapper between domain GeneratedMeditationContent and persistence MeditationOutputEntity.
 */
@Component
public class MeditationOutputMapper {
    
    /**
     * Convert domain model to JPA entity.
     * 
     * @param domain domain model
     * @return JPA entity
     */
    public MeditationOutputEntity toEntity(GeneratedMeditationContent domain) {
        MeditationOutputEntity entity = new MeditationOutputEntity(
            domain.meditationId(),
            domain.compositionId(),
            domain.userId(),
            domain.idempotencyKey(),
            domain.mediaType(),
            domain.status(),
            domain.narrationScript().text(),
            (double) domain.narrationScript().estimateDurationSeconds(),
            domain.createdAt()
        );
        
        if (domain.outputMedia() != null) entity.setOutputMediaUrl(domain.outputMedia().url());
        if (domain.subtitleFile() != null) entity.setSubtitleUrl(domain.subtitleFile().url());
        if (domain.backgroundImage() != null) entity.setBackgroundImageUrl(domain.backgroundImage().url());
        if (domain.backgroundMusic() != null) entity.setBackgroundMusicUrl(domain.backgroundMusic().url());
        if (domain.durationSeconds() != null) entity.setDurationSeconds(domain.durationSeconds());
        if (domain.errorMessage() != null) entity.setErrorMessage(domain.errorMessage());
        if (domain.completedAt() != null) entity.setCompletedAt(domain.completedAt());
        
        return entity;
    }
    
    /**
     * Convert JPA entity to domain model.
     * 
     * @param entity JPA entity
     * @return domain model
     */
    public GeneratedMeditationContent toDomain(MeditationOutputEntity entity) {
        NarrationScript narrationScript = new NarrationScript(entity.getNarrationScriptText());
        
        MediaReference outputMedia = entity.getOutputMediaUrl() != null
            ? new MediaReference(entity.getOutputMediaUrl()) : null;
        
        MediaReference subtitleFile = entity.getSubtitleUrl() != null
            ? new MediaReference(entity.getSubtitleUrl()) : null;
        
        MediaReference backgroundImage = entity.getBackgroundImageUrl() != null
            ? new MediaReference(entity.getBackgroundImageUrl()) : null;
        
        MediaReference backgroundMusic = entity.getBackgroundMusicUrl() != null
            ? new MediaReference(entity.getBackgroundMusicUrl()) : null;
        
        return new GeneratedMeditationContent(
            entity.getMeditationId(),
            entity.getCompositionId(),
            entity.getUserId(),
            entity.getIdempotencyKey(),
            entity.getMediaType(),
            entity.getStatus(),
            narrationScript,
            outputMedia,
            subtitleFile,
            backgroundImage,
            backgroundMusic,
            entity.getDurationSeconds(),
            entity.getErrorMessage(),
            entity.getCreatedAt(),
            entity.getCompletedAt()
        );
    }
}
