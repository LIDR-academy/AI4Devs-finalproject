package com.hexagonal.meditationbuilder.infrastructure.out.service.dto;

import java.util.List;

/**
 * AiTextResponse - DTO for AI text generation service response.
 * 
 * Follows OpenAI Chat Completions API response format.
 * 
 * @author Meditation Builder Team
 */
public record AiTextResponse(
        String id,
        String object,
        long created,
        String model,
        List<Choice> choices,
        Usage usage
) {

    /**
     * Individual choice in the response.
     */
    public record Choice(
            int index,
            Message message,
            String finishReason
    ) {
    }

    /**
     * Message content from AI.
     */
    public record Message(
            String role,
            String content
    ) {
    }

    /**
     * Token usage statistics.
     */
    public record Usage(
            int promptTokens,
            int completionTokens,
            int totalTokens
    ) {
    }
}
