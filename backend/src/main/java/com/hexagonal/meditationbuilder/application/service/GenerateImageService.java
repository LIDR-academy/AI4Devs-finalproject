package com.hexagonal.meditationbuilder.application.service;

import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.domain.ports.in.GenerateImageUseCase;
import com.hexagonal.meditationbuilder.domain.ports.out.ImageGenerationPort;
import com.hexagonal.meditationbuilder.domain.ports.out.ImageGenerationPort.ImageGenerationServiceException;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.micrometer.observation.annotation.Observed;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    private static final Logger logger = LoggerFactory.getLogger(GenerateImageService.class);
    private static final String AI_PROVIDER = "OpenAI";

    private final ImageGenerationPort imageGenerationPort;
    private final MeterRegistry meterRegistry;

    public GenerateImageService(ImageGenerationPort imageGenerationPort, MeterRegistry meterRegistry) {
        this.imageGenerationPort = Objects.requireNonNull(imageGenerationPort, "imageGenerationPort is required");
        this.meterRegistry = Objects.requireNonNull(meterRegistry, "meterRegistry is required");
    }

    @Override
    @Observed(name = "ai.image.generate", contextualName = "generate-meditation-image")
    public ImageReference generateImage(String prompt) {
        validatePrompt(prompt);
        
        long startTime = System.currentTimeMillis();
        logger.info("ai.image.generation.requested: promptLength={}", prompt.length());
        
        Timer.Sample sample = Timer.start(meterRegistry);
        
        try {
            ImageReference result = imageGenerationPort.generate(prompt);
            long latencyMs = System.currentTimeMillis() - startTime;
            logger.info("ai.image.generation.completed: latencyMs={}", latencyMs);
            
            // Record successful generation duration
            sample.stop(Timer.builder("meditation.ai.image.generation.duration")
                    .tag("ai_provider", AI_PROVIDER)
                    .tag("status", "success")
                    .register(meterRegistry));
            
            return result;
        } catch (ImageGenerationServiceException e) {
            long latencyMs = System.currentTimeMillis() - startTime;
            String errorCode = determineErrorCode(e);
            logger.error("ai.image.generation.failed: errorCode={}, latencyMs={}, errorMessage={}", 
                errorCode, latencyMs, e.getMessage());
            
            // Record failed generation duration
            sample.stop(Timer.builder("meditation.ai.image.generation.duration")
                    .tag("ai_provider", AI_PROVIDER)
                    .tag("status", "failure")
                    .register(meterRegistry));
            
            // Increment failure counter
            Counter.builder("meditation.ai.generation.failures")
                    .tag("ai_provider", AI_PROVIDER)
                    .tag("operation", "image")
                    .tag("error_code", errorCode)
                    .register(meterRegistry)
                    .increment();
            
            throw new ImageGenerationException("AI image generation failed: " + e.getMessage(), e);
        }
    }
    
    private String determineErrorCode(ImageGenerationServiceException e) {
        String message = e.getMessage();
        if (message != null) {
            if (message.contains("timeout") || message.contains("unavailable")) {
                return "503";
            } else if (message.contains("rate limit") || message.contains("too many requests")) {
                return "429";
            }
        }
        return "500";
    }

    private void validatePrompt(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("prompt is required and cannot be blank");
        }
    }
}
