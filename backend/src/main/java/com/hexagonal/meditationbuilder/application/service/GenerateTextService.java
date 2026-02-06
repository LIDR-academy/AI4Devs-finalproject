package com.hexagonal.meditationbuilder.application.service;

import com.hexagonal.meditationbuilder.domain.model.TextContent;
import com.hexagonal.meditationbuilder.domain.ports.in.GenerateTextUseCase;
import com.hexagonal.meditationbuilder.domain.ports.out.TextGenerationPort;
import com.hexagonal.meditationbuilder.domain.ports.out.TextGenerationPort.TextGenerationServiceException;

import java.util.Objects;

/**
 * GenerateTextService - Application service implementing GenerateTextUseCase.
 * 
 * Orchestrates TextGenerationPort calls for AI text generation and enhancement.
 * Contains NO business logic - only orchestration and error mapping.
 * 
 * Responsibilities:
 * - Validate inputs
 * - Delegate to TextGenerationPort
 * - Map infrastructure exceptions to business exceptions
 */
public class GenerateTextService implements GenerateTextUseCase {

    private final TextGenerationPort textGenerationPort;

    public GenerateTextService(TextGenerationPort textGenerationPort) {
        this.textGenerationPort = Objects.requireNonNull(textGenerationPort, "textGenerationPort is required");
    }

    @Override
    public TextContent generateText(String prompt) {
        validatePrompt(prompt);
        
        try {
            return textGenerationPort.generate(prompt);
        } catch (TextGenerationServiceException e) {
            throw new TextGenerationException("AI text generation failed: " + e.getMessage(), e);
        }
    }

    private void validatePrompt(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("prompt is required and cannot be blank");
        }
    }
}
