package com.hexagonal.playback.infrastructure.in.rest.controller;

import com.hexagonal.playback.domain.ports.in.GetPlaybackInfoUseCase;
import com.hexagonal.playback.domain.ports.in.ListMeditationsUseCase;
import com.hexagonal.playback.domain.model.Meditation;
import com.hexagonal.playback.infrastructure.in.rest.dto.MeditationListResponseDto;
import com.hexagonal.playback.infrastructure.in.rest.dto.PlaybackInfoResponseDto;
import com.hexagonal.playback.infrastructure.in.rest.mapper.DtoMapper;
import com.hexagonal.shared.security.SecurityContextHelper;
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
 * Security:
 * - UserId extracted from authenticated JWT via {@link SecurityContextHelper} (T008 migration).
 * - Previously read from {@code X-User-Id} header; that mechanism has been removed.
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
     * @return List of meditations with states and media URLs
     */
    @GetMapping
    public ResponseEntity<MeditationListResponseDto> listMeditations() {
        UUID userId = SecurityContextHelper.getRequiredUserId();

        List<Meditation> meditations = listMeditationsUseCase.execute(userId);
        MeditationListResponseDto response = dtoMapper.toMeditationListResponse(meditations);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/playback/meditations/{id}
     *
     * Retrieves playback information for a specific meditation.
     *
     * @param meditationId UUID of the meditation
     * @return Playback information with media URLs
     */
    @GetMapping("/{meditationId}")
    public ResponseEntity<PlaybackInfoResponseDto> getPlaybackInfo(
        @PathVariable UUID meditationId
    ) {
        UUID userId = SecurityContextHelper.getRequiredUserId();

        Meditation meditation = getPlaybackInfoUseCase.execute(meditationId, userId);
        PlaybackInfoResponseDto response = dtoMapper.toPlaybackInfoResponse(meditation);

        return ResponseEntity.ok(response);
    }
}
