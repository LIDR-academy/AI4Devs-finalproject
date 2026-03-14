package com.hexagonal.meditationbuilder.infrastructure.out.service;

import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.domain.model.MusicReference;
import com.hexagonal.meditationbuilder.domain.ports.out.MediaCatalogPort;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.MediaCatalogResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(MediaCatalogAdapter.class);

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
        long startTime = System.currentTimeMillis();
        log.info("external.service.call.start: service=MediaCatalog, operation=getMusic");
        
        try {
            MediaCatalogResponse.MusicListResponse response = restClient
                    .get()
                    .uri(baseUrl + "/api/media/music")
                    .retrieve()
                    .body(MediaCatalogResponse.MusicListResponse.class);

            long latencyMs = System.currentTimeMillis() - startTime;
            int count = (response != null && response.items() != null) ? response.items().size() : 0;
            log.info("external.service.call.end: service=MediaCatalog, httpStatus=200, latencyMs={}, itemCount={}", 
                latencyMs, count);

            if (response == null || response.items() == null) {
                return List.of();
            }

            return response.items().stream()
                    .map(item -> new MusicReference(item.id()))
                    .toList();
        } catch (RestClientException e) {
            long latencyMs = System.currentTimeMillis() - startTime;
            log.error("external.service.call.end: service=MediaCatalog, httpStatus=error, latencyMs={}, error={}", 
                latencyMs, e.getMessage());
            throw new MediaCatalogServiceException("Failed to fetch available music", e);
        }
    }

    @Override
    public List<ImageReference> getAvailableImages() {
        long startTime = System.currentTimeMillis();
        log.info("external.service.call.start: service=MediaCatalog, operation=getImages");
        
        try {
            MediaCatalogResponse.ImageListResponse response = restClient
                    .get()
                    .uri(baseUrl + "/api/media/images")
                    .retrieve()
                    .body(MediaCatalogResponse.ImageListResponse.class);

            long latencyMs = System.currentTimeMillis() - startTime;
            int count = (response != null && response.items() != null) ? response.items().size() : 0;
            log.info("external.service.call.end: service=MediaCatalog, httpStatus=200, latencyMs={}, itemCount={}", 
                latencyMs, count);

            if (response == null || response.items() == null) {
                return List.of();
            }

            return response.items().stream()
                    .map(item -> new ImageReference(item.id()))
                    .toList();
        } catch (RestClientException e) {
            long latencyMs = System.currentTimeMillis() - startTime;
            log.error("external.service.call.end: service=MediaCatalog, httpStatus=error, latencyMs={}, error={}", 
                latencyMs, e.getMessage());
            throw new MediaCatalogServiceException("Failed to fetch available images", e);
        }
    }

    @Override
    public boolean musicExists(MusicReference musicReference) {
        if (musicReference == null) {
            throw new IllegalArgumentException("musicReference is required");
        }

        long startTime = System.currentTimeMillis();
        log.info("external.service.call.start: service=MediaCatalog, operation=checkMusicExists, musicId={}", 
            musicReference.value());

        try {
            restClient
                    .head()
                    .uri(baseUrl + "/api/media/music/{id}", musicReference.value())
                    .retrieve()
                    .toBodilessEntity();
            
            long latencyMs = System.currentTimeMillis() - startTime;
            log.info("external.service.call.end: service=MediaCatalog, httpStatus=200, latencyMs={}, exists=true", 
                latencyMs);
            return true;
        } catch (RestClientException e) {
            long latencyMs = System.currentTimeMillis() - startTime;
            log.info("external.service.call.end: service=MediaCatalog, httpStatus=404, latencyMs={}, exists=false", 
                latencyMs);
            return false;
        }
    }

    @Override
    public boolean imageExists(ImageReference imageReference) {
        if (imageReference == null) {
            throw new IllegalArgumentException("imageReference is required");
        }

        long startTime = System.currentTimeMillis();
        log.info("external.service.call.start: service=MediaCatalog, operation=checkImageExists, imageId={}", 
            imageReference.value());

        try {
            restClient
                    .head()
                    .uri(baseUrl + "/api/media/images/{id}", imageReference.value())
                    .retrieve()
                    .toBodilessEntity();
            
            long latencyMs = System.currentTimeMillis() - startTime;
            log.info("external.service.call.end: service=MediaCatalog, httpStatus=200, latencyMs={}, exists=true", 
                latencyMs);
            return true;
        } catch (RestClientException e) {
            long latencyMs = System.currentTimeMillis() - startTime;
            log.info("external.service.call.end: service=MediaCatalog, httpStatus=404, latencyMs={}, exists=false", 
                latencyMs);
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
