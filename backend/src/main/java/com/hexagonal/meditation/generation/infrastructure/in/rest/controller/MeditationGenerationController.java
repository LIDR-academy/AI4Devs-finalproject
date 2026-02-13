package com.hexagonal.meditation.generation.infrastructure.in.rest.controller;

import com.hexagonal.meditation.generation.domain.exception.GenerationTimeoutException;
import com.hexagonal.meditation.generation.domain.exception.InvalidContentException;
import com.hexagonal.meditation.generation.domain.ports.in.GenerateMeditationContentUseCase;
import com.hexagonal.meditation.generation.domain.ports.in.GenerateMeditationContentUseCase.GenerationRequest;
import com.hexagonal.meditation.generation.infrastructure.in.rest.dto.GenerateMeditationRequest;
import com.hexagonal.meditation.generation.infrastructure.in.rest.dto.GenerationResponse;
import com.hexagonal.meditation.generation.infrastructure.in.rest.mapper.MeditationOutputDtoMapper;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller for Meditation Generation API.
 * 
 * Implements meditation content generation capability:
 * - Generate meditation content with professional narration
 * - Synchronized subtitles (SRT format)
 * - Video output (if image provided) or Audio output (if no image)
 * 
 * Bounded Context: Generation (separate from Composition/US2 and Playback/US4)
 * 
 * OpenAPI: /openapi/generation/generate-meditation.yaml
 * Operation: POST /api/v1/generation/meditations (generateMeditationContent)
 * 
 * Architecture: Infrastructure In adapter, delegates to use case.
 * No business logic - only HTTP concerns and DTO mapping.
 * 
 * Authentication: JWT (US1 - blocked).
 * - Production: validates token and extracts userId
 * - Tests: bypassed via TestSecurityConfig (mock userId from header)
 */
@RestController
@RequestMapping("/api/v1/generation/meditations")
public class MeditationGenerationController {

    private static final Logger log = LoggerFactory.getLogger(MeditationGenerationController.class);

    private final GenerateMeditationContentUseCase generateMeditationContentUseCase;
    private final MeditationOutputDtoMapper mapper;

    public MeditationGenerationController(
            GenerateMeditationContentUseCase generateMeditationContentUseCase,
            MeditationOutputDtoMapper mapper) {
        this.generateMeditationContentUseCase = generateMeditationContentUseCase;
        this.mapper = mapper;
    }

    /**
     * POST /api/v1/generation/meditations - Generate meditation content with narration.
     * 
     * Maps to BDD scenarios:
     * - Scenario 1: "Generate narrated video with synchronized subtitles"
     * - Scenario 2: "Generate narrated podcast"
     * - Scenario 3: "Processing time exceeded"
     * 
     * @param request meditation generation request (text, music, optional image)
     * @param compositionId composition ID header (in production from context)
     * @param userId user ID header (in production from JWT, in tests from mock header)
     * @return 200 OK with generation response (media URLs, status, duration)
     *         408 Request Timeout if processing time exceeds 30s
     *         400 Bad Request if validation fails
     *         503 Service Unavailable if external service fails
     */
    @PostMapping
    public ResponseEntity<GenerationResponse> generateMeditationContent(
            @Valid @RequestBody GenerateMeditationRequest request,
            @RequestHeader(value = "X-Composition-ID", required = false) UUID compositionId,
            @RequestHeader(value = "X-User-ID", required = false) UUID userId) {
        
        log.info("Generating meditation content for userId={}, compositionId={}, type={}", 
                userId, compositionId, request.imageReference() != null ? "VIDEO" : "AUDIO");

        // TODO: In production, extract userId from JWT SecurityContext instead of header
        // For now (US1 blocked), use header provided by TestSecurityConfig
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (compositionId == null) {
            compositionId = UUID.randomUUID(); // Fallback for MVP
        }

        // Map DTO request to domain request
        GenerationRequest domainRequest = new GenerationRequest(
                compositionId,
                userId,
                request.text(),
                request.musicReference(),
                request.imageReference()
        );

        // Execute use case
        var domainResponse = generateMeditationContentUseCase.generate(domainRequest);

        // Map domain response to DTO
        GenerationResponse dtoResponse = toGenerationResponse(domainResponse);

        log.info("Meditation content generated successfully: meditationId={}, status={}", 
                dtoResponse.meditationId(), dtoResponse.status());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(dtoResponse);
    }

    /**
     * Maps domain GenerationResponse to DTO GenerationResponse.
     */
    private GenerationResponse toGenerationResponse(
            GenerateMeditationContentUseCase.GenerationResponse domainResponse) {
        return new GenerationResponse(
                domainResponse.id(),
                domainResponse.mediaType().name(),
                domainResponse.mediaUrl().orElse(null),
                domainResponse.subtitleUrl().orElse(null),
                domainResponse.durationSeconds().orElse(null),
                domainResponse.status().name(),
                formatStatusMessage(domainResponse)
        );
    }

    /**
     * Formats status message based on generation status.
     */
    private String formatStatusMessage(GenerateMeditationContentUseCase.GenerationResponse response) {
        return switch (response.status()) {
            case PROCESSING -> "Generation in progress";
            case COMPLETED -> "Generation completed successfully";
            case FAILED -> "Generation failed";
            case TIMEOUT -> "Processing time exceeded";
        };
    }

    /**
     * Exception handler for GenerationTimeoutException.
     * Maps to 408 Request Timeout as per OpenAPI spec.
     */
    @ExceptionHandler(GenerationTimeoutException.class)
    public ResponseEntity<com.hexagonal.meditationbuilder.infrastructure.in.rest.dto.ErrorResponse> handleTimeoutException(
            GenerationTimeoutException ex) {
        log.warn("Generation timeout: {}", ex.getMessage());
        
        var errorResponse = new com.hexagonal.meditationbuilder.infrastructure.in.rest.dto.ErrorResponse(
                "GENERATION_TIMEOUT",
                ex.getMessage()
        );
        
        return ResponseEntity
                .status(HttpStatus.REQUEST_TIMEOUT)
                .body(errorResponse);
    }

    /**
     * Exception handler for InvalidContentException.
     * Maps to 400 Bad Request as per OpenAPI spec.
     */
    @ExceptionHandler(InvalidContentException.class)
    public ResponseEntity<com.hexagonal.meditationbuilder.infrastructure.in.rest.dto.ErrorResponse> handleInvalidContentException(
            InvalidContentException ex) {
        log.warn("Invalid content: {}", ex.getMessage());
        
        var errorResponse = new com.hexagonal.meditationbuilder.infrastructure.in.rest.dto.ErrorResponse(
                "INVALID_CONTENT",
                ex.getMessage()
        );
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    /**
     * Exception handler for RuntimeException (external service failures).
     * Maps to 503 Service Unavailable as per OpenAPI spec.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<com.hexagonal.meditationbuilder.infrastructure.in.rest.dto.ErrorResponse> handleRuntimeException(
            RuntimeException ex) {
        log.error("Generation failed: {}", ex.getMessage(), ex);
        
        var errorResponse = new com.hexagonal.meditationbuilder.infrastructure.in.rest.dto.ErrorResponse(
                "GENERATION_FAILED",
                "An error occurred during generation: " + ex.getMessage()
        );
        
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(errorResponse);
    }
}
