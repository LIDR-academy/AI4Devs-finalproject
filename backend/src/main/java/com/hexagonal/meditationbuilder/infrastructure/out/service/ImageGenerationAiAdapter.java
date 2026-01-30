package com.hexagonal.meditationbuilder.infrastructure.out.service;

import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.domain.ports.out.ImageGenerationPort;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiImageRequest;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiImageResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Objects;

/**
 * ImageGenerationAiAdapter - Infrastructure adapter implementing ImageGenerationPort.
 * 
 * Connects to external AI image generation service (e.g., DALL-E, Stable Diffusion).
 * Uses Spring RestClient for HTTP communication.
 * 
 * Security: No prompts or AI responses are logged (sensitive data protection).
 * 
 * Error Mapping:
 * - Timeout → ImageGenerationServiceException (HTTP 503)
 * - Rate limit → ImageGenerationServiceException (HTTP 429)
 * - Other errors → ImageGenerationServiceException
 * 
 * @author Meditation Builder Team
 */
public class ImageGenerationAiAdapter implements ImageGenerationPort {

    private static final Logger log = LoggerFactory.getLogger(ImageGenerationAiAdapter.class);

    private static final String DEFAULT_SIZE = "1024x1024";
    private static final String DEFAULT_QUALITY = "standard";
    private static final int DEFAULT_N = 1;

    private final RestClient restClient;
    private final String baseUrl;
    private final String apiKey;

    /**
     * Constructor with RestClient, base URL, and API key.
     * 
     * @param restClient configured RestClient instance
     * @param baseUrl base URL of the AI image generation service
     * @param apiKey API key for authentication
     */
    public ImageGenerationAiAdapter(RestClient restClient, String baseUrl, String apiKey) {
        this.restClient = Objects.requireNonNull(restClient, "restClient is required");
        this.baseUrl = Objects.requireNonNull(baseUrl, "baseUrl is required");
        this.apiKey = Objects.requireNonNull(apiKey, "apiKey is required");
    }

    @Override
    public ImageReference generate(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("prompt is required");
        }

        log.debug("Initiating AI image generation request");

        AiImageRequest request = new AiImageRequest(
                prompt,
                DEFAULT_N,
                DEFAULT_SIZE,
                DEFAULT_QUALITY
        );

        try {
            AiImageResponse response = restClient
                    .post()
                    .uri(baseUrl + "/v1/images/generations")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        if (res.getStatusCode().value() == 429) {
                            log.warn("AI image service rate limit exceeded");
                            throw new ImageGenerationServiceException(
                                    "AI service rate limit exceeded. Please try again later.");
                        }
                        log.error("AI image service client error: {}", res.getStatusCode());
                        throw new ImageGenerationServiceException(
                                "AI service request failed: " + res.getStatusCode());
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                        log.error("AI image service unavailable: {}", res.getStatusCode());
                        throw new ImageGenerationServiceException(
                                "AI service unavailable. Please try again later.");
                    })
                    .body(AiImageResponse.class);

            if (response == null || response.data() == null || response.data().isEmpty()) {
                log.error("Empty response from AI image service");
                throw new ImageGenerationServiceException("AI service returned empty response");
            }

            AiImageResponse.ImageData imageData = response.data().getFirst();
            String imageUrl = imageData.url();

            if (imageUrl == null || imageUrl.isBlank()) {
                log.error("AI image service returned blank URL");
                throw new ImageGenerationServiceException("AI service returned blank image URL");
            }

            log.debug("AI image generation completed successfully");
            return new ImageReference(imageUrl);

        } catch (RestClientException e) {
            log.error("Network error during AI image generation");
            throw new ImageGenerationServiceException(
                    "Failed to communicate with AI service: " + e.getMessage(), e);
        }
    }
}
