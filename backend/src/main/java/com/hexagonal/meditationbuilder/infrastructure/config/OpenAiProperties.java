package com.hexagonal.meditationbuilder.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for OpenAI API integration.
 * 
 * <p>Mapped from application.yml under prefix 'ai.openai'.
 * Supports separate timeout configurations for text and image generation
 * since image generation typically requires longer processing time.</p>
 * 
 * <p>Security note: api-key should be provided via environment variable
 * OPENAI_API_KEY, never committed to source control.</p>
 * 
 * @param baseUrl OpenAI API base URL (default: https://api.openai.com)
 * @param apiKey OpenAI API key (required, from environment)
 * @param text Text generation specific configuration
 * @param image Image generation specific configuration
 */
@ConfigurationProperties(prefix = "ai.openai")
public record OpenAiProperties(
        String baseUrl,
        String apiKey,
        TextConfig text,
        ImageConfig image
) {
    
    /**
     * Text generation configuration.
     * 
     * @param connectTimeoutMs Connection timeout in milliseconds
     * @param readTimeoutMs Read timeout in milliseconds
     * @param model OpenAI model to use (e.g., gpt-4o-mini)
     */
    public record TextConfig(
            int connectTimeoutMs,
            int readTimeoutMs,
            String model
    ) {
        public TextConfig {
            if (connectTimeoutMs <= 0) {
                connectTimeoutMs = 5000;
            }
            if (readTimeoutMs <= 0) {
                readTimeoutMs = 30000;
            }
            if (model == null || model.isBlank()) {
                model = "gpt-4o-mini";
            }
        }
    }
    
    /**
     * Image generation configuration.
     * 
     * @param connectTimeoutMs Connection timeout in milliseconds
     * @param readTimeoutMs Read timeout in milliseconds (longer for images)
     * @param model DALL-E model to use (e.g., dall-e-3)
     * @param size Image size (e.g., 1024x1024)
     * @param quality Image quality (standard or hd)
     */
    public record ImageConfig(
            int connectTimeoutMs,
            int readTimeoutMs,
            String model,
            String size,
            String quality
    ) {
        public ImageConfig {
            if (connectTimeoutMs <= 0) {
                connectTimeoutMs = 5000;
            }
            if (readTimeoutMs <= 0) {
                readTimeoutMs = 60000;
            }
            if (model == null || model.isBlank()) {
                model = "dall-e-3";
            }
            if (size == null || size.isBlank()) {
                size = "1024x1024";
            }
            if (quality == null || quality.isBlank()) {
                quality = "standard";
            }
        }
    }
    
    /**
     * Validates that required properties are configured.
     * 
     * @throws IllegalStateException if api-key is missing
     */
    public void validate() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                "OpenAI API key is required. Set OPENAI_API_KEY environment variable.");
        }
    }
}
