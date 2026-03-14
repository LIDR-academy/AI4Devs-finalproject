package com.hexagonal.meditationbuilder.infrastructure.in.rest.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for setting an image.
 * 
 * Maps to: PUT /compositions/{compositionId}/image
 * OpenAPI: SetImageRequest
 * 
 * @param imageReference Reference to image (manual or AI-generated)
 */
public record SetImageRequest(
        @NotBlank(message = "Image reference is required")
        String imageReference
) {}
