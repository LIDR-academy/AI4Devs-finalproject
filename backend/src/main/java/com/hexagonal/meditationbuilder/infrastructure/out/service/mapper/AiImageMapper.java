package com.hexagonal.meditationbuilder.infrastructure.out.service.mapper;

import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiImageRequest;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiImageResponse;

/**
 * AiImageMapper - Maps between domain types and AI image service DTOs.
 * 
 * Encapsulates the mapping logic between domain model and external API formats.
 * Follows hexagonal architecture by keeping infrastructure details out of domain.
 * 
 * @author Meditation Builder Team
 */
public final class AiImageMapper {

    private static final String DEFAULT_SIZE = "1024x1024";
    private static final String STANDARD_QUALITY = "standard";
    private static final String HD_QUALITY = "hd";

    private AiImageMapper() {
        // Utility class - prevent instantiation
    }

    /**
     * Creates an image generation request from a prompt.
     * 
     * @param prompt image description
     * @return AI service request DTO
     */
    public static AiImageRequest toRequest(String prompt) {
        return AiImageRequest.standard(prompt);
    }

    /**
     * Creates a high-quality image generation request from a prompt.
     * 
     * @param prompt image description
     * @return AI service request DTO with HD quality
     */
    public static AiImageRequest toHighQualityRequest(String prompt) {
        return AiImageRequest.highQuality(prompt);
    }

    /**
     * Creates a custom image generation request.
     * 
     * @param prompt image description
     * @param size image size (e.g., "1024x1024", "1792x1024")
     * @param highQuality whether to use HD quality
     * @return AI service request DTO
     */
    public static AiImageRequest toCustomRequest(String prompt, String size, boolean highQuality) {
        return new AiImageRequest(
                prompt,
                1,
                size,
                highQuality ? HD_QUALITY : STANDARD_QUALITY
        );
    }

    /**
     * Extracts ImageReference from AI service response.
     * 
     * @param response AI service response
     * @return domain ImageReference with URL
     * @throws IllegalArgumentException if response is invalid
     */
    public static ImageReference fromResponse(AiImageResponse response) {
        if (response == null) {
            throw new IllegalArgumentException("response is required");
        }

        if (response.data() == null || response.data().isEmpty()) {
            throw new IllegalArgumentException("response has no data");
        }

        AiImageResponse.ImageData imageData = response.data().getFirst();
        
        if (imageData.url() == null || imageData.url().isBlank()) {
            throw new IllegalArgumentException("response has no image URL");
        }

        return new ImageReference(imageData.url());
    }

    /**
     * Extracts the revised prompt from AI service response if available.
     * 
     * Some AI services (like DALL-E 3) may revise the prompt for better results.
     * 
     * @param response AI service response
     * @return revised prompt, or null if not available
     */
    public static String getRevisedPrompt(AiImageResponse response) {
        if (response == null || response.data() == null || response.data().isEmpty()) {
            return null;
        }
        return response.data().getFirst().revisedPrompt();
    }

    /**
     * Checks if the response contains a base64 encoded image.
     * 
     * @param response AI service response
     * @return true if response contains base64 image data
     */
    public static boolean hasBase64Image(AiImageResponse response) {
        if (response == null || response.data() == null || response.data().isEmpty()) {
            return false;
        }
        String b64Json = response.data().getFirst().b64Json();
        return b64Json != null && !b64Json.isBlank();
    }

    /**
     * Extracts base64 image data from response.
     * 
     * @param response AI service response
     * @return base64 encoded image, or null if not available
     */
    public static String getBase64Image(AiImageResponse response) {
        if (response == null || response.data() == null || response.data().isEmpty()) {
            return null;
        }
        return response.data().getFirst().b64Json();
    }
}
