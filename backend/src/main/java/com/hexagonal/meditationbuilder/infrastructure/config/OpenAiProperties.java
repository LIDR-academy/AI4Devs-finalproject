package com.hexagonal.meditationbuilder.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * OpenAI configuration properties.
 * Java 21 record — immutable, no Lombok required.
 */
@ConfigurationProperties(prefix = "openai")
public record OpenAiProperties(
    String baseUrl,
    String apiKey,
    Text text,
    Image image,
    String outputFormat,
    String background,
    String responseFormat
) {
    /** Ensure nested objects are never null to avoid NPEs on partial YAML config. */
    public OpenAiProperties {
        if (text == null) text = new Text(null, null, null, null, null, null);
        if (image == null) image = new Image(null, null, null, null, null);
    }

    public record Text(
        String model,
        Double temperature,
        Integer maxTokens,
        Double topP,
        Double frequencyPenalty,
        Double presencePenalty
    ) {}

    public record Image(
        String model,
        String size,
        String quality,
        String responseFormat,
        Integer n
    ) {}
}
