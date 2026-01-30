package com.hexagonal.meditationbuilder.infrastructure.in.rest.dto;

/**
 * Response DTO for image preview.
 * 
 * Maps to: ImagePreviewResponse in OpenAPI
 * Used in: GET /compositions/{id}/preview/image
 * 
 * @param previewUrl URL for image preview display
 * @param imageReference Reference to selected image
 */
public record ImagePreviewResponse(
        String previewUrl,
        String imageReference
) {}
