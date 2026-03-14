package com.hexagonal.playback.infrastructure.in.rest.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO representing a meditation item in the list.
 * 
 * Maps to OpenAPI MeditationItem schema.
 * 
 * JSON Serialization:
 * - mediaUrls field omitted if null (not playable states)
 * - All other fields always present
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MeditationItemDto(
    UUID id,
    String title,
    String state,
    String stateLabel,
    Instant createdAt,
    MediaUrlsDto mediaUrls
) {
    public MeditationItemDto {
        if (id == null) throw new IllegalArgumentException("Id cannot be null");
        if (title == null || title.isBlank()) throw new IllegalArgumentException("Title cannot be null or blank");
        if (state == null || state.isBlank()) throw new IllegalArgumentException("State cannot be null or blank");
        if (stateLabel == null || stateLabel.isBlank()) throw new IllegalArgumentException("StateLabel cannot be null or blank");
        if (createdAt == null) throw new IllegalArgumentException("CreatedAt cannot be null");
        // mediaUrls can be null for non-completed meditations
    }
}
