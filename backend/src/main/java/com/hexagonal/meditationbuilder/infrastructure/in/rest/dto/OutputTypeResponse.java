package com.hexagonal.meditationbuilder.infrastructure.in.rest.dto;

/**
 * Response DTO for output type determination.
 * 
 * Maps to: OutputTypeResponse in OpenAPI
 * Used in: GET /compositions/{id}/output-type
 * 
 * @param outputType PODCAST (no image) or VIDEO (has image)
 */
public record OutputTypeResponse(
        String outputType
) {}
