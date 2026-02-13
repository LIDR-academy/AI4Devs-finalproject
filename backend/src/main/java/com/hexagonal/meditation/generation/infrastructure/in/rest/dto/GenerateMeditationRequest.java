package com.hexagonal.meditation.generation.infrastructure.in.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for generating meditation content with narration.
 * 
 * Maps to: POST /generation/meditations
 * OpenAPI: GenerateMeditationRequest
 * 
 * Core capability:
 * - Transforms composed text + music (+ optional image) into narrated video or audio
 * - Includes professional narration (Google TTS) and synchronized subtitles (SRT)
 * - Output type determined by image presence: VIDEO (with image) or AUDIO (without)
 * 
 * Processing:
 * - Pre-validates processing time (rejects if >30s timeout)
 * - Idempotent: same (userId, text, music, image) → same meditationId
 * 
 * @param text Meditation text content to narrate (required, 1-10000 chars)
 * @param musicReference Reference to background music from media catalog (required)
 * @param imageReference Optional image reference (if present → VIDEO, if absent → AUDIO)
 */
public record GenerateMeditationRequest(
        @NotBlank(message = "Text content is required")
        @Size(min = 1, max = 10000, message = "Text content must be between 1 and 10000 characters")
        String text,

        @NotBlank(message = "Music reference is required")
        String musicReference,

        String imageReference
) {}
