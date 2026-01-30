package com.hexagonal.meditationbuilder.infrastructure.out.service;

import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.domain.model.MusicReference;
import com.hexagonal.meditationbuilder.domain.ports.out.MediaCatalogPort;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.MediaCatalogResponse;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Objects;

/**
 * MediaCatalogAdapter - Infrastructure adapter implementing MediaCatalogPort.
 * 
 * Connects to external Media Catalog service to retrieve available music and images.
 * Uses Spring RestClient for HTTP communication.
 * 
 * Follows hexagonal architecture: implements domain port, handles external service details.
 * 
 * @author Meditation Builder Team
 */
public class MediaCatalogAdapter implements MediaCatalogPort {

    private final RestClient restClient;
    private final String baseUrl;

    /**
     * Constructor with RestClient and base URL.
     * 
     * @param restClient configured RestClient instance
     * @param baseUrl base URL of the Media Catalog service
     */
    public MediaCatalogAdapter(RestClient restClient, String baseUrl) {
        this.restClient = Objects.requireNonNull(restClient, "restClient is required");
        this.baseUrl = Objects.requireNonNull(baseUrl, "baseUrl is required");
    }

    @Override
    public List<MusicReference> getAvailableMusic() {
        try {
            MediaCatalogResponse.MusicListResponse response = restClient
                    .get()
                    .uri(baseUrl + "/api/media/music")
                    .retrieve()
                    .body(MediaCatalogResponse.MusicListResponse.class);

            if (response == null || response.items() == null) {
                return List.of();
            }

            return response.items().stream()
                    .map(item -> new MusicReference(item.id()))
                    .toList();
        } catch (RestClientException e) {
            throw new MediaCatalogServiceException("Failed to fetch available music", e);
        }
    }

    @Override
    public List<ImageReference> getAvailableImages() {
        try {
            MediaCatalogResponse.ImageListResponse response = restClient
                    .get()
                    .uri(baseUrl + "/api/media/images")
                    .retrieve()
                    .body(MediaCatalogResponse.ImageListResponse.class);

            if (response == null || response.items() == null) {
                return List.of();
            }

            return response.items().stream()
                    .map(item -> new ImageReference(item.id()))
                    .toList();
        } catch (RestClientException e) {
            throw new MediaCatalogServiceException("Failed to fetch available images", e);
        }
    }

    @Override
    public boolean musicExists(MusicReference musicReference) {
        if (musicReference == null) {
            throw new IllegalArgumentException("musicReference is required");
        }

        try {
            restClient
                    .head()
                    .uri(baseUrl + "/api/media/music/{id}", musicReference.value())
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (RestClientException e) {
            // 404 or other errors mean music doesn't exist
            return false;
        }
    }

    @Override
    public boolean imageExists(ImageReference imageReference) {
        if (imageReference == null) {
            throw new IllegalArgumentException("imageReference is required");
        }

        try {
            restClient
                    .head()
                    .uri(baseUrl + "/api/media/images/{id}", imageReference.value())
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (RestClientException e) {
            // 404 or other errors mean image doesn't exist
            return false;
        }
    }

    /**
     * Exception thrown when Media Catalog service communication fails.
     */
    public static class MediaCatalogServiceException extends RuntimeException {
        public MediaCatalogServiceException(String message, Throwable cause) {
            super(message, cause);
        }

        public MediaCatalogServiceException(String message) {
            super(message);
        }
    }
}
