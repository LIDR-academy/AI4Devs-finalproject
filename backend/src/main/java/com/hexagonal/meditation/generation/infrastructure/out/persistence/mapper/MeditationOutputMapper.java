package com.hexagonal.meditation.generation.infrastructure.out.persistence.mapper;

import com.hexagonal.meditation.generation.domain.model.GeneratedMeditationContent;
import com.hexagonal.meditation.generation.domain.model.MediaReference;
import com.hexagonal.meditation.generation.domain.model.NarrationScript;
import com.hexagonal.meditation.generation.infrastructure.out.persistence.entity.MeditationOutputEntity;
import org.springframework.stereotype.Component;

import java.util.Optional;

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
        
        domain.outputMedia().ifPresent(media -> entity.setOutputMediaUrl(media.url()));
        domain.subtitleFile().ifPresent(subtitle -> entity.setSubtitleUrl(subtitle.url()));
        domain.backgroundImage().ifPresent(image -> entity.setBackgroundImageUrl(image.url()));
        domain.backgroundMusic().ifPresent(music -> entity.setBackgroundMusicUrl(music.url()));
        domain.errorMessage().ifPresent(entity::setErrorMessage);
        domain.completedAt().ifPresent(entity::setCompletedAt);
        
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
        
        Optional<MediaReference> outputMedia = Optional.ofNullable(entity.getOutputMediaUrl())
            .map(MediaReference::new);
        
        Optional<MediaReference> subtitleFile = Optional.ofNullable(entity.getSubtitleUrl())
            .map(MediaReference::new);
        
        Optional<MediaReference> backgroundImage = Optional.ofNullable(entity.getBackgroundImageUrl())
            .map(MediaReference::new);
        
        Optional<MediaReference> backgroundMusic = Optional.ofNullable(entity.getBackgroundMusicUrl())
            .map(MediaReference::new);
        
        Optional<String> errorMessage = Optional.ofNullable(entity.getErrorMessage());
        
        Optional<java.time.Instant> completedAt = Optional.ofNullable(entity.getCompletedAt());
        
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
            errorMessage,
            entity.getCreatedAt(),
            completedAt
        );
    }
}
