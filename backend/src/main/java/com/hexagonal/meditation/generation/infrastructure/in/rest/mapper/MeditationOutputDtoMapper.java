package com.hexagonal.meditation.generation.infrastructure.in.rest.mapper;

import com.hexagonal.meditation.generation.domain.model.MeditationOutput;
import com.hexagonal.meditation.generation.infrastructure.in.rest.dto.GenerationResponse;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Mapper for converting between MeditationOutput domain model and REST DTOs.
 * 
 * Mapping direction:
 * - Domain → DTO: For responses (toGenerationResponse)
 * 
 * Note: Request mapping (DTO → Domain) is handled directly in the use case
 * because it involves creating value objects (NarrationScript, MediaReference)
 * which require validation and business logic.
 * 
 * Architecture: Part of infrastructure layer, depends on domain but not vice versa.
 * No business logic: pure data transformation.
 */
@Component
public class MeditationOutputDtoMapper {

    /**
     * Maps MeditationOutput domain entity to GenerationResponse DTO.
     * 
     * Transformations:
     * - Enum types to String (MediaType, GenerationStatus)
     * - Optional fields to nullable (mediaUrl, subtitleUrl, durationSeconds)
     * - Status-specific message formatting
     * 
     * @param output domain entity (must not be null)
     * @return REST response DTO
     * @throws NullPointerException if output is null
     */
    public GenerationResponse toGenerationResponse(MeditationOutput output) {
        Objects.requireNonNull(output, "MeditationOutput must not be null");

        return new GenerationResponse(
                output.id(),
                output.type().name(),
                output.mediaUrl(),
                output.subtitleUrl(),
                output.durationSeconds(),
                output.status().name(),
                formatStatusMessage(output)
        );
    }

    /**
     * Formats a status message based on generation status.
     * 
     * @param output domain entity
     * @return human-readable status message
     */
    private String formatStatusMessage(MeditationOutput output) {
        return switch (output.status()) {
            case PROCESSING -> "Generation in progress";
            case COMPLETED -> "Generation completed successfully";
            case FAILED -> "Generation failed";
            case TIMEOUT -> "Processing time exceeded";
        };
    }
}
