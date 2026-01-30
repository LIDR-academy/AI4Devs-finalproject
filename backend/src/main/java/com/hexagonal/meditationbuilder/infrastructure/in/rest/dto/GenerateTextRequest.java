package com.hexagonal.meditationbuilder.infrastructure.in.rest.dto;

import jakarta.validation.constraints.Size;

/**
 * Request DTO for AI text generation or enhancement.
 * 
 * Maps to: POST /compositions/{compositionId}/text/generate
 * OpenAPI: GenerateTextRequest
 * 
 * Both fields are optional to support:
 * - Generation from scratch (only context provided)
 * - Enhancement (existingText provided)
 * - Both (existingText + context for guided enhancement)
 * 
 * @param existingText Existing text to enhance (null for generation from scratch)
 * @param context Keywords or context for generation
 */
public record GenerateTextRequest(
        @Size(max = 10000, message = "Existing text must not exceed 10000 characters")
        String existingText,
        
        @Size(max = 500, message = "Context must not exceed 500 characters")
        String context
) {}
