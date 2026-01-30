package com.hexagonal.meditationbuilder.infrastructure.out.service.dto;

import java.util.List;

/**
 * AiTextRequest - DTO for AI text generation service request.
 * 
 * Follows OpenAI Chat Completions API format.
 * Can be adapted for Azure OpenAI or other compatible services.
 * 
 * @author Meditation Builder Team
 */
public record AiTextRequest(
        String model,
        List<Message> messages,
        double temperature,
        int maxTokens
) {

    private static final String DEFAULT_MODEL = "gpt-4o-mini";
    private static final double DEFAULT_TEMPERATURE = 0.7;
    private static final int DEFAULT_MAX_TOKENS = 2000;

    /**
     * Message in the conversation.
     */
    public record Message(String role, String content) {
    }

    /**
     * Creates a request for text generation from a prompt.
     * 
     * @param systemPrompt system instructions
     * @param userPrompt user's generation request
     * @return configured request
     */
    public static AiTextRequest forGeneration(String systemPrompt, String userPrompt) {
        return new AiTextRequest(
                DEFAULT_MODEL,
                List.of(
                        new Message("system", systemPrompt),
                        new Message("user", userPrompt)
                ),
                DEFAULT_TEMPERATURE,
                DEFAULT_MAX_TOKENS
        );
    }

    /**
     * Creates a request for text enhancement.
     * 
     * @param systemPrompt system instructions for enhancement
     * @param textToEnhance existing text to enhance
     * @return configured request
     */
    public static AiTextRequest forEnhancement(String systemPrompt, String textToEnhance) {
        return new AiTextRequest(
                DEFAULT_MODEL,
                List.of(
                        new Message("system", systemPrompt),
                        new Message("user", "Please enhance the following meditation text:\n\n" + textToEnhance)
                ),
                DEFAULT_TEMPERATURE,
                DEFAULT_MAX_TOKENS
        );
    }
}
