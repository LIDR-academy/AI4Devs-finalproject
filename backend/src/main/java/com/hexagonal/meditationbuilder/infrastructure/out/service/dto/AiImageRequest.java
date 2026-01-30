package com.hexagonal.meditationbuilder.infrastructure.out.service.dto;

/**
 * AiImageRequest - DTO for AI image generation service request.
 * 
 * Follows OpenAI DALL-E API format.
 * Can be adapted for other image generation services.
 * 
 * @author Meditation Builder Team
 */
public record AiImageRequest(
        String prompt,
        int n,
        String size,
        String quality
) {

    /**
     * Creates a standard image generation request.
     * 
     * @param prompt image description
     * @return configured request with defaults
     */
    public static AiImageRequest standard(String prompt) {
        return new AiImageRequest(
                prompt,
                1,
                "1024x1024",
                "standard"
        );
    }

    /**
     * Creates a high-quality image generation request.
     * 
     * @param prompt image description
     * @return configured request with HD quality
     */
    public static AiImageRequest highQuality(String prompt) {
        return new AiImageRequest(
                prompt,
                1,
                "1024x1024",
                "hd"
        );
    }
}
