package com.hexagonal.playback.infrastructure.in.rest.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for GET /api/v1/playback/meditations/{id}.
 * Contains playback information for a COMPLETED meditation.
 * 
 * Maps to OpenAPI PlaybackInfoResponse schema.
 * 
 * Business Rules:
 * - Only returned for COMPLETED meditations
 * - mediaUrls always present (non-null)
 */
public record PlaybackInfoResponseDto(
    UUID id,
    String title,
    String state,
    String stateLabel,
    Instant createdAt,
    MediaUrlsDto mediaUrls
) {
    public PlaybackInfoResponseDto {
        if (id == null) throw new IllegalArgumentException("Id cannot be null");
        if (title == null || title.isBlank()) throw new IllegalArgumentException("Title cannot be null or blank");
        if (state == null || state.isBlank()) throw new IllegalArgumentException("State cannot be null or blank");
        if (stateLabel == null || stateLabel.isBlank()) throw new IllegalArgumentException("StateLabel cannot be null or blank");
        if (createdAt == null) throw new IllegalArgumentException("CreatedAt cannot be null");
        if (mediaUrls == null) throw new IllegalArgumentException("MediaUrls cannot be null for playback info");
    }
}
