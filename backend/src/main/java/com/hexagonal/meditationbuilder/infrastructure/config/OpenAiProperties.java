package com.hexagonal.meditationbuilder.infrastructure.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "openai")
@Data
public class OpenAiProperties {
    private String baseUrl;
    private String apiKey;
    private Text text = new Text();
    private Image image = new Image();
    private String outputFormat; // sólo GPT Image
    private String background;   // sólo GPT Image
    private String responseFormat; // sólo DALL·E

    @Data
    public static class Text {
        private String model;
        private Double temperature;
        private Integer maxTokens;
        private Double topP;
        private Double frequencyPenalty;
        private Double presencePenalty;
    }

    @Data
    public static class Image {
        private String model;
        private String size;
        private String quality;
        private String responseFormat;
        private Integer n;
    }
}
