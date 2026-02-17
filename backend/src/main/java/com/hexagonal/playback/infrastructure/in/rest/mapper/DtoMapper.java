package com.hexagonal.playback.infrastructure.in.rest.mapper;

import com.hexagonal.playback.domain.model.Meditation;
import com.hexagonal.playback.domain.model.MediaUrls;
import com.hexagonal.playback.domain.model.ProcessingState;
import com.hexagonal.playback.infrastructure.in.rest.dto.*;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Mapper for converting domain models to REST DTOs.
 * 
 * Responsibilities:
 * - Map domain Meditation → MeditationItemDto / PlaybackInfoResponseDto
 * - Map domain MediaUrls → MediaUrlsDto
 * - Translate ProcessingState enum → Spanish state labels
 * 
 * State Label Translations (as per OpenAPI spec):
 * - PENDING → "En cola"
 * - PROCESSING → "Generando"
 * - COMPLETED → "Completada"
 * - FAILED → "Fallida"
 */
@Component
public class DtoMapper {

    /**
     * Maps a list of meditations to MeditationListResponseDto.
     * 
     * @param meditations Domain meditations (already ordered by createdAt DESC)
     * @return DTO for GET /playback/meditations response
     */
    public MeditationListResponseDto toMeditationListResponse(List<Meditation> meditations) {
        List<MeditationItemDto> items = meditations.stream()
            .map(this::toMeditationItem)
            .toList();
        
        return new MeditationListResponseDto(items);
    }

    /**
     * Maps a single meditation to MeditationItemDto.
     * 
     * @param meditation Domain meditation
     * @return DTO for meditation item in list
     */
    public MeditationItemDto toMeditationItem(Meditation meditation) {
        return new MeditationItemDto(
            meditation.id(),
            meditation.title(),
            meditation.processingState().name(),
            translateStateLabel(meditation.processingState()),
            meditation.createdAt(),
            meditation.mediaUrls() != null ? toMediaUrlsDto(meditation.mediaUrls()) : null
        );
    }

    /**
     * Maps a meditation to PlaybackInfoResponseDto.
     * 
     * @param meditation Domain meditation (must be COMPLETED)
     * @return DTO for GET /playback/meditations/{id} response
     */
    public PlaybackInfoResponseDto toPlaybackInfoResponse(Meditation meditation) {
        return new PlaybackInfoResponseDto(
            meditation.id(),
            meditation.title(),
            meditation.processingState().name(),
            translateStateLabel(meditation.processingState()),
            meditation.createdAt(),
            meditation.mediaUrls() != null ? toMediaUrlsDto(meditation.mediaUrls()) : null
        );
    }

    /**
     * Maps domain MediaUrls to MediaUrlsDto.
     * 
     * @param mediaUrls Domain media URLs
     * @return DTO for media URLs
     */
    private MediaUrlsDto toMediaUrlsDto(MediaUrls mediaUrls) {
        return new MediaUrlsDto(
            mediaUrls.audioUrl(),
            mediaUrls.videoUrl(),
            mediaUrls.subtitlesUrl()
        );
    }

    /**
     * Translates ProcessingState enum to Spanish user-friendly label.
     * 
     * @param state Domain processing state
     * @return Spanish label for UI display
     */
    private String translateStateLabel(ProcessingState state) {
        return state.getLabel(); // ProcessingState already has Spanish labels
    }
}
