package com.hexagonal.meditationbuilder.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for Media Catalog service integration.
 * 
 * <p>Mapped from application.yml under prefix 'media-catalog'.
 * The media catalog service provides access to pre-defined music
 * and image assets for meditation compositions.</p>
 * 
 * @param baseUrl Media Catalog service base URL
 * @param connectTimeoutMs Connection timeout in milliseconds
 * @param readTimeoutMs Read timeout in milliseconds
 */
@ConfigurationProperties(prefix = "media-catalog")
public record MediaCatalogProperties(
        String baseUrl,
        int connectTimeoutMs,
        int readTimeoutMs
) {
    
    public MediaCatalogProperties {
        if (baseUrl == null || baseUrl.isBlank()) {
            baseUrl = "http://localhost:8081";
        }
        if (connectTimeoutMs <= 0) {
            connectTimeoutMs = 5000;
        }
        if (readTimeoutMs <= 0) {
            readTimeoutMs = 10000;
        }
    }
}
