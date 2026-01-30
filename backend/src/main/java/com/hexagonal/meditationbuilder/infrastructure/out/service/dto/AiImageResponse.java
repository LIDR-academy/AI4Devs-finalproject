package com.hexagonal.meditationbuilder.infrastructure.out.service.dto;

import java.util.List;

/**
 * AiImageResponse - DTO for AI image generation service response.
 * 
 * Follows OpenAI DALL-E API response format.
 * 
 * @author Meditation Builder Team
 */
public record AiImageResponse(
        long created,
        List<ImageData> data
) {

    /**
     * Individual generated image data.
     */
    public record ImageData(
            String url,
            String revisedPrompt,
            String b64Json
    ) {
        /**
         * Creates ImageData with URL only.
         */
        public static ImageData withUrl(String url) {
            return new ImageData(url, null, null);
        }

        /**
         * Creates ImageData with base64 encoded image.
         */
        public static ImageData withBase64(String b64Json) {
            return new ImageData(null, null, b64Json);
        }
    }
}
