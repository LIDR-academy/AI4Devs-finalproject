package com.hexagonal.meditationbuilder.infrastructure.in.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating a new meditation composition.
 * 
 * Maps to: POST /compositions
 * OpenAPI: CreateCompositionRequest (implicit, composition starts with text)
 * 
 * @param text Initial meditation text content (mandatory)
 */
public record CreateCompositionRequest(
        @NotBlank(message = "Text content is required")
        @Size(max = 10000, message = "Text content must not exceed 10000 characters")
        String text
) {}
