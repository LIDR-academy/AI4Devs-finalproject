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
import com.hexagonal.meditationbuilder.infrastructure.config.AiProperties;
import com.hexagonal.meditationbuilder.infrastructure.config.OpenAiProperties;

public class ImageGenerationAiAdapter implements ImageGenerationPort {

    private static final Logger log = LoggerFactory.getLogger(ImageGenerationAiAdapter.class);

    private final RestClient restClient;
    private final String baseUrl;
    private final String apiKey;
    private final AiProperties aiProperties;
    private final OpenAiProperties openAiProperties; // <-- añade esta dependencia

    public ImageGenerationAiAdapter(RestClient restClient,
                                    String baseUrl,
                                    String apiKey,
                                    AiProperties aiProperties,
                                    OpenAiProperties openAiProperties) {
        this.restClient = Objects.requireNonNull(restClient, "restClient is required");
        this.baseUrl = Objects.requireNonNull(baseUrl, "baseUrl is required");
        this.apiKey = Objects.requireNonNull(apiKey, "apiKey is required");
        this.aiProperties = Objects.requireNonNull(aiProperties, "aiProperties is required");
        this.openAiProperties = Objects.requireNonNull(openAiProperties, "openAiProperties is required");
    }

    @Override
    public ImageReference generate(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("prompt is required");
        }

        // Metaprompt
        String metaprompt = aiProperties.getImageMetaprompt();
        String finalPrompt = (metaprompt != null && !metaprompt.isBlank())
                ? metaprompt + "\n" + prompt
                : prompt;

        // Lee configuración de imagen
        var imgCfg = openAiProperties.getImage();
        String model = imgCfg.getModel();                    // p.ej. gpt-image-1-mini
        String size = defaultIfBlank(imgCfg.getSize(), "1024x1024");
        String quality = defaultIfBlank(imgCfg.getQuality(), "low"); // u "standard" si usas DALL·E
        String responseFormat = defaultIfBlank(imgCfg.getResponseFormat(), "url");
        Integer n = imgCfg.getN() != null ? imgCfg.getN() : 1;

        log.debug("Initiating AI image generation request (model={}, size={}, quality={}, format={})",
                model, size, quality, responseFormat);

        AiImageRequest request = new AiImageRequest(
                model,
                finalPrompt,
                n,
                size,
                quality,
                responseFormat
        );

        try {
                AiImageResponse response = restClient
                    .post()
                    // Recomendado: "/v1/images" (nuevo). Si usas legacy DALL·E: "/v1/images/generations"
                    .uri(baseUrl + "/v1/images")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        int code = res.getStatusCode().value();
                        if (code == 401 || code == 403) {
                            log.error("Unauthorized/Forbidden from image API: {}", code);
                            throw new ImageGenerationServiceException("Auth failed against image API.");
                        }
                        if (code == 429) {
                            log.warn("AI image service rate limit exceeded");
                            throw new ImageGenerationServiceException("Rate limit exceeded. Try again later.");
                        }
                        log.error("AI image service client error: {}", res.getStatusCode());
                        throw new ImageGenerationServiceException("Image API request failed: " + res.getStatusCode());
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                        log.error("AI image service unavailable: {}", res.getStatusCode());
                        throw new ImageGenerationServiceException("Image API unavailable. Please try again later.");
                    })
                    .body(AiImageResponse.class);

            if (response == null || response.data() == null || response.data().isEmpty()) {
                log.error("Empty response from AI image service");
                throw new ImageGenerationServiceException("AI service returned empty response");
            }

            AiImageResponse.ImageData imageData = response.data().get(0);

            // Soporta URL o base64
            String imageUrl = imageData.url();
            String b64 = imageData.b64Json();

            if (("url".equalsIgnoreCase(responseFormat) || imageUrl != null) && (imageUrl == null || imageUrl.isBlank())) {
                log.error("AI image service returned blank URL");
                throw new ImageGenerationServiceException("AI service returned blank image URL");
            }

            if ("b64_json".equalsIgnoreCase(responseFormat)) {
                if (b64 == null || b64.isBlank()) {
                    log.error("AI image service returned blank base64");
                    throw new ImageGenerationServiceException("AI service returned blank base64 image");
                }
                // Si tu dominio trabaja con URL, puedes subir el b64 a tu storage y devolver su URL.
                // De momento, devuelvo un pseudo-URL con esquema data: para que funcione de extremo a extremo.
                String dataUrl = "data:image/png;base64," + b64;
                log.debug("AI image generation completed successfully (base64)");
                return new ImageReference(dataUrl);
            }

            log.debug("AI image generation completed successfully (url)");
            return new ImageReference(imageUrl);

        } catch (RestClientException e) {
            log.error("Network error during AI image generation");
            throw new ImageGenerationServiceException(
                    "Failed to communicate with AI image service: " + e.getMessage(), e);
        }
    }

    private static String defaultIfBlank(String val, String def) {
        return (val == null || val.isBlank()) ? def : val;
    }
}
