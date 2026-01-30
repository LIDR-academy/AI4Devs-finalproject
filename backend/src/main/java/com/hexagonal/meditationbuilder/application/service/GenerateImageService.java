package com.hexagonal.meditationbuilder.application.service;

import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.domain.ports.in.GenerateImageUseCase;
import com.hexagonal.meditationbuilder.domain.ports.out.ImageGenerationPort;
import com.hexagonal.meditationbuilder.domain.ports.out.ImageGenerationPort.ImageGenerationServiceException;

import java.util.Objects;

/**
 * GenerateImageService - Application service implementing GenerateImageUseCase.
 * 
 * Orchestrates ImageGenerationPort calls for AI image generation.
 * Contains NO business logic - only orchestration and error mapping.
 * 
 * Responsibilities:
 * - Validate inputs
 * - Delegate to ImageGenerationPort
 * - Map infrastructure exceptions to business exceptions
 */
public class GenerateImageService implements GenerateImageUseCase {

    private final ImageGenerationPort imageGenerationPort;

    public GenerateImageService(ImageGenerationPort imageGenerationPort) {
        this.imageGenerationPort = Objects.requireNonNull(imageGenerationPort, "imageGenerationPort is required");
    }

    @Override
    public ImageReference generateImage(String prompt) {
        validatePrompt(prompt);
        
        try {
            return imageGenerationPort.generate(prompt);
        } catch (ImageGenerationServiceException e) {
            throw new ImageGenerationException("AI image generation failed: " + e.getMessage(), e);
        }
    }

    private void validatePrompt(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("prompt is required and cannot be blank");
        }
    }
}
