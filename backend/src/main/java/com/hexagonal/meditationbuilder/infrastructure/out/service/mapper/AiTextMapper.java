package com.hexagonal.meditationbuilder.infrastructure.out.service.mapper;

import com.hexagonal.meditationbuilder.domain.model.TextContent;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiTextRequest;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiTextResponse;

/**
 * AiTextMapper - Maps between domain types and AI text service DTOs.
 * 
 * Encapsulates the mapping logic between domain model and external API formats.
 * Follows hexagonal architecture by keeping infrastructure details out of domain.
 * 
 * @author Meditation Builder Team
 */
public final class AiTextMapper {

    private AiTextMapper() {
        // Utility class - prevent instantiation
    }

    /**
     * Creates a text generation request from a prompt.
     * 
     * @param systemPrompt instructions for the AI
     * @param userPrompt user's request
     * @return AI service request DTO
     */
    public static AiTextRequest toGenerationRequest(String systemPrompt, String userPrompt) {
        return AiTextRequest.forGeneration(systemPrompt, userPrompt);
    }

    /**
     * Extracts TextContent from AI service response.
     * 
     * @param response AI service response
     * @return domain TextContent
     * @throws IllegalArgumentException if response is invalid
     */
    public static TextContent fromResponse(AiTextResponse response) {
        if (response == null) {
            throw new IllegalArgumentException("response is required");
        }

        if (response.choices() == null || response.choices().isEmpty()) {
            throw new IllegalArgumentException("response has no choices");
        }

        AiTextResponse.Choice choice = response.choices().getFirst();
        
        if (choice.message() == null || choice.message().content() == null) {
            throw new IllegalArgumentException("response choice has no content");
        }

        String content = choice.message().content().trim();
        
        if (content.isBlank()) {
            throw new IllegalArgumentException("response content is blank");
        }

        return new TextContent(content);
    }

    /**
     * Checks if the AI response indicates successful completion.
     * 
     * @param response AI service response
     * @return true if response completed successfully
     */
    public static boolean isSuccessful(AiTextResponse response) {
        if (response == null || response.choices() == null || response.choices().isEmpty()) {
            return false;
        }

        String finishReason = response.choices().getFirst().finishReason();
        return "stop".equals(finishReason);
    }

    /**
     * Extracts token usage from response.
     * 
     * @param response AI service response
     * @return total tokens used, or 0 if not available
     */
    public static int getTotalTokens(AiTextResponse response) {
        if (response == null || response.usage() == null) {
            return 0;
        }
        return response.usage().totalTokens();
    }
}
