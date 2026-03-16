package com.hexagonal.playback.infrastructure.in.rest.controller;

import com.hexagonal.playback.domain.ports.in.GetPlaybackInfoUseCase;
import com.hexagonal.playback.domain.ports.in.ListMeditationsUseCase;
import com.hexagonal.playback.domain.model.Meditation;
import com.hexagonal.playback.infrastructure.in.rest.dto.MeditationListResponseDto;
import com.hexagonal.playback.infrastructure.in.rest.dto.PlaybackInfoResponseDto;
import com.hexagonal.playback.infrastructure.in.rest.mapper.DtoMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for Playback BC endpoints.
 * 
 * Implements OpenAPI specification: list-play-meditations.yaml
 * 
 * Endpoints:
 * - GET /api/v1/playback/meditations - List user meditations
 * - GET /api/v1/playback/meditations/{id} - Get playback info
 * 
 * Architecture:
 * - Hexagonal adapter (infrastructure layer)
 * - Delegates to application use cases (ports)
 * - Maps domain models to DTOs via DtoMapper
 * 
 * Security (Temporary until US1):
 * - UserId from X-User-Id header for testing
 * - Will be replaced with JWT in US1
 */
@RestController
@RequestMapping("/v1/playback/meditations")
public class PlaybackController {

    private final ListMeditationsUseCase listMeditationsUseCase;
    private final GetPlaybackInfoUseCase getPlaybackInfoUseCase;
    private final DtoMapper dtoMapper;

    public PlaybackController(
        ListMeditationsUseCase listMeditationsUseCase,
        GetPlaybackInfoUseCase getPlaybackInfoUseCase,
        DtoMapper dtoMapper
    ) {
        this.listMeditationsUseCase = listMeditationsUseCase;
        this.getPlaybackInfoUseCase = getPlaybackInfoUseCase;
        this.dtoMapper = dtoMapper;
    }

    /**
     * GET /api/v1/playback/meditations
     * 
     * Lists all meditations for the authenticated user.
     * 
     * Business Rules:
     * - Only user's own meditations returned (userId from header - temporary until US1)
     * - All states included: PENDING, PROCESSING, COMPLETED, FAILED
     * - Ordered by createdAt DESC (most recent first)
     * - Empty list if no meditations
     * 
     * Maps to BDD Scenario 1: "Listar las meditaciones del usuario con su estado"
     * 
     * @param userIdHeader User ID from X-User-Id header (temporary until US1 JWT)
     * @return List of meditations with states and media URLs
     */
    @GetMapping
    public ResponseEntity<MeditationListResponseDto> listMeditations(
        @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        UUID userId = parseUserId(userIdHeader);
        
        List<Meditation> meditations = listMeditationsUseCase.execute(userId);
        MeditationListResponseDto response = dtoMapper.toMeditationListResponse(meditations);
        
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/playback/meditations/{id}
     * 
     * Retrieves playback information for a specific meditation.
     * 
     * Business Rules:
     * - Meditation must exist and belong to user (404 if not)
     * - Meditation must be COMPLETED (409 if not playable)
     * - Returns media URLs for playback
     * 
     * Maps to BDD Scenario 2: "Reproducir una meditación completada"
     * 
     * Exception Handling:
     * - MeditationNotFoundException → 404 (handled by @RestControllerAdvice)
     * - MeditationNotPlayableException → 409 (handled by @RestControllerAdvice)
     * 
     * @param meditationId UUID of the meditation
     * @param userIdHeader User ID from X-User-Id header (temporary until US1 JWT)
     * @return Playback information with media URLs
     */
    @GetMapping("/{meditationId}")
    public ResponseEntity<PlaybackInfoResponseDto> getPlaybackInfo(
        @PathVariable UUID meditationId,
        @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        UUID userId = parseUserId(userIdHeader);
        
        Meditation meditation = getPlaybackInfoUseCase.execute(meditationId, userId);
        PlaybackInfoResponseDto response = dtoMapper.toPlaybackInfoResponse(meditation);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Parses userId from header.
     * 
     * Temporary until US1 implements JWT authentication.
     * 
     * @param userIdHeader X-User-Id header value
     * @return User UUID
     * @throws IllegalArgumentException if userId is missing or invalid
     */
    private UUID parseUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            throw new IllegalArgumentException("X-User-Id header is required");
        }
        
        try {
            return UUID.fromString(userIdHeader);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid X-User-Id header format: " + userIdHeader, e);
        }
    }
}
