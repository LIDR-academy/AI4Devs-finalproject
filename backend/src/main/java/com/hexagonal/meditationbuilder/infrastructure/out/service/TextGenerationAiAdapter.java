package com.hexagonal.meditationbuilder.infrastructure.out.service;

import com.hexagonal.meditationbuilder.domain.model.TextContent;
import com.hexagonal.meditationbuilder.domain.ports.out.TextGenerationPort;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiTextRequest;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiTextResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.hexagonal.meditationbuilder.infrastructure.config.AiProperties;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Objects;

/**
 * TextGenerationAiAdapter - Infrastructure adapter implementing TextGenerationPort.
 * 
 * Connects to external AI text generation service (e.g., OpenAI, Azure OpenAI).
 * Uses Spring RestClient for HTTP communication.
 * 
 * Security: No prompts or AI responses are logged (sensitive data protection).
 * 
 * Error Mapping:
 * - Timeout → TextGenerationServiceException (HTTP 503)
 * - Rate limit → TextGenerationServiceException (HTTP 429)
 * - Other errors → TextGenerationServiceException
 * 
 * @author Meditation Builder Team
 */
public class TextGenerationAiAdapter implements TextGenerationPort {

    private static final Logger log = LoggerFactory.getLogger(TextGenerationAiAdapter.class);
    
    private static final String GENERATION_SYSTEM_PROMPT = 
            "You are a meditation content writer. Generate calming, mindful meditation text.";

    private final RestClient restClient;
    private final String baseUrl;
    private final String apiKey;
    private final AiProperties aiProperties;

    /**
     * Constructor with RestClient, base URL, and API key.
     * 
     * @param restClient configured RestClient instance
     * @param baseUrl base URL of the AI text generation service
     * @param apiKey API key for authentication
     */
    public TextGenerationAiAdapter(RestClient restClient, String baseUrl, String apiKey, AiProperties aiProperties) {
        this.restClient = Objects.requireNonNull(restClient, "restClient is required");
        this.baseUrl = Objects.requireNonNull(baseUrl, "baseUrl is required");
        this.apiKey = Objects.requireNonNull(apiKey, "apiKey is required");
        this.aiProperties = Objects.requireNonNull(aiProperties, "aiProperties is required");
    }

    @Override
    public TextContent generate(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("prompt is required");
        }

        log.debug("Initiating AI text generation request");
        // Prepend metaprompt if present
        String metaprompt = aiProperties.getTextMetaprompt();
        String finalPrompt = (metaprompt != null && !metaprompt.isBlank())
                ? metaprompt + "\n" + prompt
                : prompt;
        AiTextRequest request = AiTextRequest.forGeneration(GENERATION_SYSTEM_PROMPT, finalPrompt);
        return executeRequest(request, "generation");
    }

    private TextContent executeRequest(AiTextRequest request, String operation) {
        try {
            AiTextResponse response = restClient
                    .post()
                    .uri(baseUrl + "/v1/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        if (res.getStatusCode().value() == 429) {
                            log.warn("AI service rate limit exceeded during {}", operation);
                            throw new TextGenerationServiceException(
                                    "AI service rate limit exceeded. Please try again later.");
                        }
                        log.error("AI service client error during {}: {}", operation, res.getStatusCode());
                        throw new TextGenerationServiceException(
                                "AI service request failed: " + res.getStatusCode());
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                        log.error("AI service unavailable during {}: {}", operation, res.getStatusCode());
                        throw new TextGenerationServiceException(
                                "AI service unavailable. Please try again later.");
                    })
                    .body(AiTextResponse.class);

            if (response == null || response.choices() == null || response.choices().isEmpty()) {
                log.error("Empty response from AI service during {}", operation);
                throw new TextGenerationServiceException("AI service returned empty response");
            }

            String generatedText = response.choices().getFirst().message().content();
            
            if (generatedText == null || generatedText.isBlank()) {
                log.error("AI service returned blank content during {}", operation);
                throw new TextGenerationServiceException("AI service returned blank content");
            }

            log.debug("AI text {} completed successfully", operation);
            return new TextContent(generatedText.trim());

        } catch (RestClientException e) {
            log.error("Network error during AI text {}", operation);
            throw new TextGenerationServiceException(
                    "Failed to communicate with AI service: " + e.getMessage(), e);
        }
    }
}
