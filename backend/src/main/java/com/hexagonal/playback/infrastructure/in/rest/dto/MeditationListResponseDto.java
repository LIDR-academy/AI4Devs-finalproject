package com.hexagonal.playback.infrastructure.in.rest.dto;

import java.util.List;

/**
 * Response DTO for GET /api/v1/playback/meditations.
 * Contains list of all meditations for the authenticated user.
 * 
 * Maps to OpenAPI MeditationListResponse schema.
 */
public record MeditationListResponseDto(
    List<MeditationItemDto> meditations
) {
    public MeditationListResponseDto {
        if (meditations == null) {
            throw new IllegalArgumentException("Meditations list cannot be null");
        }
    }
}
