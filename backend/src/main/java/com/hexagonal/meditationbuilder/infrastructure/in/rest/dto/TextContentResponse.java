package com.hexagonal.meditationbuilder.infrastructure.in.rest.dto;

/**
 * Response DTO for generated/enhanced text content.
 * 
 * Maps to: TextContentResponse in OpenAPI
 * Used in: POST /compositions/{id}/text/generate
 * 
 * @param text Generated or enhanced meditation text
 */
public record TextContentResponse(
        String text
) {}
