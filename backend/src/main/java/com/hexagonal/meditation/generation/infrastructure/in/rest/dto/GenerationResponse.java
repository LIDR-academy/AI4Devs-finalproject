package com.hexagonal.meditation.generation.infrastructure.in.rest.dto;

import java.util.UUID;

/**
 * Response DTO for meditation generation.
 * 
 * Maps to: GenerationResponse in OpenAPI
 * Used in: POST /generation/meditations response
 * 
 * Contains:
 * - Meditation ID and type (VIDEO/AUDIO)
 * - Presigned S3 URLs for media and subtitles
 * - Duration and status information
 * 
 * Status progression:
 * - PROCESSING: Generation in progress (mediaUrl/subtitle may be null)
 * - COMPLETED: Successfully generated and stored in S3
 * - FAILED: Generation failed (TTS/rendering/storage error)
 * - TIMEOUT: Processing time exceeded (>30s)
 * 
 * @param meditationId Unique ID of the generated meditation
 * @param type Output media type (VIDEO or AUDIO)
 * @param mediaUrl Presigned S3 URL for video/audio (null if still processing)
 * @param subtitleUrl Presigned S3 URL for subtitle file SRT (null if still processing)
 * @param durationSeconds Total duration in seconds (null if still processing)
 * @param status Generation status (PROCESSING/COMPLETED/FAILED/TIMEOUT)
 * @param message Status message or error details
 */
public record GenerationResponse(
        UUID meditationId,
        String type,
        String mediaUrl,
        String subtitleUrl,
        Integer durationSeconds,
        String status,
        String message
) {}
