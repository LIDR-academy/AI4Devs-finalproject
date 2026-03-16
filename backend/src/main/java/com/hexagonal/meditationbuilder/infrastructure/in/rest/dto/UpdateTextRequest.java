package com.hexagonal.meditationbuilder.infrastructure.in.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for updating meditation text.
 * 
 * Maps to: PUT /compositions/{compositionId}/text
 * OpenAPI: UpdateTextRequest
 * 
 * @param text New meditation text content (preserved exactly as provided)
 */
public record UpdateTextRequest(
        @NotBlank(message = "Text content is required")
        @Size(min = 1, max = 10000, message = "Text content must be between 1 and 10000 characters")
        String text
) {}
