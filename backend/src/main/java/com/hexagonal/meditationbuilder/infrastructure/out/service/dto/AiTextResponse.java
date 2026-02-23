package com.hexagonal.meditationbuilder.infrastructure.out.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * AiTextResponse - DTO for OpenAI Chat Completions response.
 */
public record AiTextResponse(
        String id,
        String object,
        long created,
        String model,
        List<Choice> choices,
        Usage usage
) {
    public static record Choice(
            int index,
            Message message,
            @JsonProperty("finish_reason") String finishReason
    ) {}

    public static record Message(
            String role,
            String content
    ) {}

    public static record Usage(
            @JsonProperty("prompt_tokens") int promptTokens,
            @JsonProperty("completion_tokens") int completionTokens,
            @JsonProperty("total_tokens") int totalTokens
    ) {}
}