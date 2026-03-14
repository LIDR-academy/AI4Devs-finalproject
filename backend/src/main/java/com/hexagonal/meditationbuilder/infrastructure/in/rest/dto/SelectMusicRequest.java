package com.hexagonal.meditationbuilder.infrastructure.in.rest.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for selecting background music.
 * 
 * Maps to: PUT /compositions/{compositionId}/music
 * OpenAPI: SelectMusicRequest
 * 
 * @param musicReference Reference to music from media catalog
 */
public record SelectMusicRequest(
        @NotBlank(message = "Music reference is required")
        String musicReference
) {}
