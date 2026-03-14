package com.hexagonal.meditationbuilder.infrastructure.in.rest.dto;

/**
 * Response DTO for music preview.
 * 
 * Maps to: MusicPreviewResponse in OpenAPI
 * Used in: GET /compositions/{id}/preview/music
 * 
 * @param previewUrl URL for music preview playback
 * @param musicReference Reference to selected music
 */
public record MusicPreviewResponse(
        String previewUrl,
        String musicReference
) {}
