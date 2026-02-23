package com.hexagonal.playback.infrastructure.in.rest.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * DTO representing media URLs for playback.
 * 
 * Maps to OpenAPI MediaUrls schema.
 * 
 * JSON Serialization:
 * - Null fields omitted from JSON response
 * - At least one URL should be present for playable meditations
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MediaUrlsDto(
    String audioUrl,
    String videoUrl,
    String subtitlesUrl
) {
    // All fields can be null - validation in domain layer
}
