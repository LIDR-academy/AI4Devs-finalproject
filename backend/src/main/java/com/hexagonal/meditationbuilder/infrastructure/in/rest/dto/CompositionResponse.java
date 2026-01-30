package com.hexagonal.meditationbuilder.infrastructure.in.rest.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for meditation composition.
 * 
 * Maps to: CompositionResponse in OpenAPI
 * Used in: POST/PUT composition endpoints
 * 
 * @param id Composition unique identifier
 * @param textContent Meditation text content (preserved exactly as entered)
 * @param musicReference Reference to selected music (null if not selected)
 * @param imageReference Reference to image (null if not selected)
 * @param outputType PODCAST or VIDEO based on image presence
 * @param createdAt Creation timestamp
 * @param updatedAt Last update timestamp
 */
public record CompositionResponse(
        UUID id,
        String textContent,
        String musicReference,
        String imageReference,
        String outputType,
        Instant createdAt,
        Instant updatedAt
) {}
