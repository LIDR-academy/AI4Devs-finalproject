package com.hexagonal.meditationbuilder.infrastructure.out.service.mapper;

import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiImageRequest;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiImageResponse;

import java.util.List;
import java.util.Objects;

/**
 * AiImageMapper - Maps between domain types and AI image service DTOs.
 *
 * Encapsulates the mapping logic between domain model and external API formats.
 * Follows hexagonal architecture by keeping infrastructure details out of domain.
 *
 * NOTE:
 * - OpenAI Image API requires 'model' in the request. If no model is provided here,
 *   ensure your adapter injects it from configuration.
 * - Response may contain either a URL (response_format=url) or base64 (response_format=b64_json).
 *
 * @author Meditation Builder Team
 */
public final class AiImageMapper {

    // Defaults razonables para la Image API (puedes cambiarlos si lo prefieres)
    private static final String DEFAULT_SIZE = "1024x1024";
    private static final String DEFAULT_QUALITY = "low";       // "low" | "medium" | "high" (GPT Image)
    private static final String DEFAULT_RESPONSE_FORMAT = "url"; // "url" | "b64_json"
    private static final int DEFAULT_N = 1;

    private AiImageMapper() {
        // Utility class - prevent instantiation
    }

    /* -------------------------------------------------------------------------
     * REQUEST MAPPING
     * ---------------------------------------------------------------------- */

    /**
     * Creates a standard image generation request for a given prompt with sane defaults.
     * IMPORTANT: This does NOT set the 'model'. Make sure your adapter fills it from config.
     */
    public static AiImageRequest toRequest(String prompt) {
        Objects.requireNonNull(prompt, "prompt is required");
        return new AiImageRequest(
                /* model = */ null, // el adapter debería completar esto desde properties
                prompt,
                DEFAULT_N,
                DEFAULT_SIZE,
                DEFAULT_QUALITY,
                DEFAULT_RESPONSE_FORMAT
        );
    }

    /**
     * Creates a high-quality image generation request (quality = "high").
     * IMPORTANT: This does NOT set the 'model'. Make sure your adapter fills it from config.
     */
    public static AiImageRequest toHighQualityRequest(String prompt) {
        Objects.requireNonNull(prompt, "prompt is required");
        return new AiImageRequest(
                /* model = */ null,
                prompt,
                DEFAULT_N,
                DEFAULT_SIZE,
                "high",
                DEFAULT_RESPONSE_FORMAT
        );
    }

    /**
     * Fully customizable image generation request.
     *
     * @param model           model id (e.g., "gpt-image-1-mini", "gpt-image-1")
     * @param prompt          image description
     * @param n               images to generate
     * @param size            e.g., "1024x1024", "1792x1024", "1024x1792"
     * @param quality         "low"|"medium"|"high" (GPT Image) o "standard"/"hd" (DALL·E 3)
     * @param responseFormat  "url"|"b64_json"
     */
    public static AiImageRequest toCustomRequest(
            String model,
            String prompt,
            Integer n,
            String size,
            String quality,
            String responseFormat
    ) {
        Objects.requireNonNull(prompt, "prompt is required");

        return new AiImageRequest(
                (model != null && !model.isBlank()) ? model : null,
                prompt,
                (n != null && n > 0) ? n : DEFAULT_N,
                (size != null && !size.isBlank()) ? size : DEFAULT_SIZE,
                (quality != null && !quality.isBlank()) ? quality : DEFAULT_QUALITY,
                (responseFormat != null && !responseFormat.isBlank()) ? responseFormat : DEFAULT_RESPONSE_FORMAT
        );
    }

    /* -------------------------------------------------------------------------
     * RESPONSE MAPPING
     * ---------------------------------------------------------------------- */

    /**
     * Extracts ImageReference from AI service response.
     * Supports both URL (response_format=url) and base64 (response_format=b64_json).
     *
     * If base64 is present and URL is absent, returns a data URL: "data:image/png;base64,<b64>".
     */
    public static ImageReference fromResponse(AiImageResponse response) {
        if (response == null) {
            throw new IllegalArgumentException("response is required");
        }

        List<AiImageResponse.ImageData> data = response.data();
        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException("response has no data");
        }

        AiImageResponse.ImageData imageData = data.get(0);

        // Preferir URL si existe
        String url = imageData.url();
        if (url != null && !url.isBlank()) {
            return new ImageReference(url);
        }

        // Si no hay URL, intentar base64
        String b64 = imageData.b64Json();
        if (b64 != null && !b64.isBlank()) {
            // data URL para que el front pueda renderizar sin storage externo
            String dataUrl = "data:image/png;base64," + b64;
            return new ImageReference(dataUrl);
        }

        throw new IllegalArgumentException("response contains neither image URL nor base64 data");
    }

    /**
     * Extracts the revised prompt from AI service response if available (e.g., DALL·E 3).
     *
     * @return revised prompt, or null if not available
     */
    public static String getRevisedPrompt(AiImageResponse response) {
        if (response == null) return null;
        List<AiImageResponse.ImageData> data = response.data();
        if (data == null || data.isEmpty()) return null;

        AiImageResponse.ImageData first = data.get(0);
        return first.revisedPrompt();
    }

    /**
     * Checks if the response contains a base64 encoded image.
     */
    public static boolean hasBase64Image(AiImageResponse response) {
        if (response == null) return false;
        List<AiImageResponse.ImageData> data = response.data();
        if (data == null || data.isEmpty()) return false;

        String b64 = data.get(0).b64Json();
        return b64 != null && !b64.isBlank();
    }

    /**
     * Extracts base64 image data from response (without the "data:" prefix).
     *
     * @return base64 encoded image, or null if not available
     */
    public static String getBase64Image(AiImageResponse response) {
        if (response == null) return null;
        List<AiImageResponse.ImageData> data = response.data();
        if (data == null || data.isEmpty()) return null;

        return data.get(0).b64Json();
    }
}