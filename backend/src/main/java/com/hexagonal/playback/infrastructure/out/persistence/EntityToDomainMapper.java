package com.hexagonal.playback.infrastructure.out.persistence;

import com.hexagonal.playback.domain.model.Meditation;
import com.hexagonal.playback.domain.model.MediaUrls;
import com.hexagonal.playback.domain.model.ProcessingState;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between JPA entities and domain models.
 * Handles state mapping and MediaUrls construction.
 */
@Component
public class EntityToDomainMapper {

    /**
     * Converts a JPA MeditationEntity to a domain Meditation.
     * Uses reconstituteFromPersistence to skip temporal validation on persisted data.
     * 
     * @param entity the JPA entity from database
     * @return domain Meditation model
     * @throws IllegalArgumentException if entity is null or has invalid data
     */
    public Meditation toDomain(MeditationEntity entity) {
        if (entity == null) {
            throw new IllegalArgumentException("entity cannot be null");
        }

        ProcessingState state = mapStatus(entity.getStatus());
        MediaUrls mediaUrls = buildMediaUrls(entity);

        return new Meditation(
            entity.getMeditationId(),
            entity.getUserId(),
            entity.getNarrationScriptText() != null ? entity.getNarrationScriptText() : "Untitled",
            entity.getCreatedAt(),
            state,
            mediaUrls
        );
    }

    /**
     * Maps database status string to domain ProcessingState enum.
     * 
     * @param dbStatus database status value (PROCESSING, COMPLETED, FAILED, TIMEOUT)
     * @return corresponding ProcessingState
     * @throws IllegalArgumentException if status is null or unknown
     */
    private ProcessingState mapStatus(String dbStatus) {
        if (dbStatus == null) {
            throw new IllegalArgumentException("status cannot be null");
        }

        return switch (dbStatus) {
            case "PROCESSING" -> ProcessingState.PROCESSING;
            case "COMPLETED" -> ProcessingState.COMPLETED;
            case "FAILED" -> ProcessingState.FAILED;
            case "TIMEOUT" -> ProcessingState.FAILED; // TIMEOUT is treated as FAILED in Playback BC
            default -> throw new IllegalArgumentException("Unknown status: " + dbStatus);
        };
    }

    /**
     * Builds MediaUrls value object from entity fields.
     * Returns null if no media URLs are present (typical for non-completed states).
     * 
     * @param entity the JPA entity
     * @return MediaUrls if at least one URL exists, null otherwise
     */
    private MediaUrls buildMediaUrls(MeditationEntity entity) {
        String outputUrl = entity.getOutputMediaUrl();
        String subtitlesUrl = entity.getSubtitleUrl();

        if (isEmpty(outputUrl)) {
            return null;
        }

        String audioUrl = null;
        String videoUrl = null;

        if ("AUDIO".equalsIgnoreCase(entity.getMediaType())) {
            audioUrl = outputUrl;
        } else if ("VIDEO".equalsIgnoreCase(entity.getMediaType())) {
            videoUrl = outputUrl;
        }

        // MediaUrls constructor validates that at least one URL is provided
        return new MediaUrls(audioUrl, videoUrl, subtitlesUrl);
    }

    /**
     * Checks if a string is null or blank.
     * 
     * @param value the string to check
     * @return true if null or blank, false otherwise
     */
    private boolean isEmpty(String value) {
        return value == null || value.isBlank();
    }
}
