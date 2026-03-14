package com.hexagonal.meditationbuilder.infrastructure.out.service.dto;

import java.util.List;

/**
 * MediaCatalogResponse - DTOs for Media Catalog service responses.
 * 
 * Contains records for deserializing external service responses.
 * Maps to domain types via infrastructure adapters.
 * 
 * @author Meditation Builder Team
 */
public final class MediaCatalogResponse {

    private MediaCatalogResponse() {
        // Utility class - prevent instantiation
    }

    /**
     * Response containing list of available music items.
     */
    public record MusicListResponse(List<MusicItem> items) {
    }

    /**
     * Individual music item from catalog.
     */
    public record MusicItem(
            String id,
            String name,
            String artist,
            int durationSeconds,
            String previewUrl
    ) {
    }

    /**
     * Response containing list of available image items.
     */
    public record ImageListResponse(List<ImageItem> items) {
    }

    /**
     * Individual image item from catalog.
     */
    public record ImageItem(
            String id,
            String name,
            String thumbnailUrl,
            String fullUrl,
            int width,
            int height
    ) {
    }
}
