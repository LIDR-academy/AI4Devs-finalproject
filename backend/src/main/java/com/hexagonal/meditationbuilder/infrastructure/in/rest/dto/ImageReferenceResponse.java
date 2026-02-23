package com.hexagonal.meditationbuilder.infrastructure.in.rest.dto;

/**
 * Response DTO for AI-generated image.
 * 
 * Maps to: ImageReferenceResponse in OpenAPI
 * Used in: POST /compositions/{id}/image/generate
 * 
 * @param imageReference Reference to AI-generated image
 */
public record ImageReferenceResponse(
        String imageReference
) {}
