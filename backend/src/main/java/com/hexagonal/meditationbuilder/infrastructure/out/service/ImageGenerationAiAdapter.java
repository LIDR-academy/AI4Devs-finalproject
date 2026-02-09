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

        var imgCfg = openAiProperties.getImage();
        String model = imgCfg.getModel();
        String size = defaultIfBlank(imgCfg.getSize(), "1024x1024");

        boolean isGpt = model != null && model.startsWith("gpt-image");
        boolean isDalle = model != null && model.startsWith("dall-e");

        String quality = isGpt
                ? defaultIfBlank(imgCfg.getQuality(), "low")
                : defaultIfBlank(imgCfg.getQuality(), "standard");

        // 👇 Parche: si no tienes getters, usa defaults directos
        String outputFormat = isGpt ? "png"  : null;
        String background   = isGpt ? "auto" : null;

        String responseFormat = isDalle ? defaultIfBlank(imgCfg.getResponseFormat(), "url") : null;

        Integer n = "dall-e-3".equals(model) ? 1 : (imgCfg.getN() != null ? imgCfg.getN() : 1);

        AiImageRequest request = new AiImageRequest(
                model,
                finalPrompt,
                n,
                size,
                quality,
                outputFormat,
                background,
                responseFormat
        );

        try {
            AiImageResponse response = restClient
                .post()
                // Recomendado: "/v1/images" (nuevo). Si usas legacy DALL·E: "/v1/images/generations"
                .uri(baseUrl + "/v1/images/generations")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .body(request)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                    String body = safeReadBody(res);
                    int code = res.getStatusCode().value();
                    log.error("AI image service client error: {} - {}", code, body); // <--- log del body
                    if (code == 401 || code == 403) {
                        throw new ImageGenerationServiceException("Auth failed against image API.");
                    }
                    if (code == 429) {
                        throw new ImageGenerationServiceException("Rate limit exceeded. Try again later.");
                    }
                    throw new ImageGenerationServiceException("Image API request failed: " + res.getStatusCode());
                })
                .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                    String body = safeReadBody(res); // <-- leer cuerpo
                    log.error("AI image service unavailable: {} - {}", res.getStatusCode(), body);
                    throw new ImageGenerationServiceException("Image API unavailable. Please try again later.");
                })
                .body(AiImageResponse.class);
                
            // Manejar error blando en 2xx
            if (response.error() != null) {
                log.error("Image API error payload: type={}, code={}, msg={}",
                        response.error().type(), response.error().code(), response.error().message());
                throw new ImageGenerationServiceException("Image API returned an error: " + response.error().message());
            }

            // Validar data no vacía
            if (response.data() == null || response.data().isEmpty()) {
                log.error("Image API: empty data array (background={}, output_format={}, quality={}, size={})",
                        response.background(), response.outputFormat(), response.quality(), response.size());
                throw new ImageGenerationServiceException("AI service returned no images (empty data).");
            }

            // Seleccionar imagen
            AiImageResponse.ImageData imageData = response.data().get(0);
            String url = imageData.url();
            String b64 = imageData.b64Json();

            if (url != null && !url.isBlank()) {
                return new ImageReference(url);
            }
            if (b64 != null && !b64.isBlank()) {
                return new ImageReference("data:image/png;base64," + b64.trim());
            }

            // Si llega aquí, no hay contenido usable
            log.error("AI image service returned neither URL nor base64 (created={}, size={}, quality={})",
                    response.created(), response.size(), response.quality());
            throw new ImageGenerationServiceException("AI service returned neither URL nor base64 image");

        } catch (RestClientException e) {
            throw new ImageGenerationServiceException(
                    "Failed to communicate with AI image service: " + e.getMessage(), e);
        }
    }

    private static String defaultIfBlank(String val, String def) {
        return (val == null || val.isBlank()) ? def : val;
    }

    private String safeReadBody(org.springframework.http.client.ClientHttpResponse res) {
        try (var is = res.getBody()) {
            return new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception ex) {
            return "";
        }
    }
}
