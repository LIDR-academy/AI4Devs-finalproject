package com.hexagonal.meditationbuilder.application.service;

import com.hexagonal.meditationbuilder.domain.model.TextContent;
import com.hexagonal.meditationbuilder.domain.ports.in.GenerateTextUseCase;
import com.hexagonal.meditationbuilder.domain.ports.out.TextGenerationPort;
import com.hexagonal.meditationbuilder.domain.ports.out.TextGenerationPort.TextGenerationServiceException;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.micrometer.observation.annotation.Observed;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    private static final Logger logger = LoggerFactory.getLogger(GenerateTextService.class);
    private static final String AI_PROVIDER = "OpenAI";

    private final TextGenerationPort textGenerationPort;
    private final MeterRegistry meterRegistry;

    public GenerateTextService(TextGenerationPort textGenerationPort, MeterRegistry meterRegistry) {
        this.textGenerationPort = Objects.requireNonNull(textGenerationPort, "textGenerationPort is required");
        this.meterRegistry = Objects.requireNonNull(meterRegistry, "meterRegistry is required");
    }

    @Override
    @Observed(name = "ai.text.generate", contextualName = "generate-meditation-text")
    public TextContent generateText(String prompt) {
        validatePrompt(prompt);
        
        long startTime = System.currentTimeMillis();
        logger.info("ai.text.generation.requested: promptLength={}", prompt.length());
        
        Timer.Sample sample = Timer.start(meterRegistry);
        
        try {
            TextContent result = textGenerationPort.generate(prompt);
            long latencyMs = System.currentTimeMillis() - startTime;
            logger.info("ai.text.generation.completed: latencyMs={}, resultLength={}", 
                latencyMs, result.value().length());
            
            // Record successful generation duration
            sample.stop(Timer.builder("meditation.ai.text.generation.duration")
                    .tag("ai_provider", AI_PROVIDER)
                    .tag("status", "success")
                    .register(meterRegistry));
            
            return result;
        } catch (TextGenerationServiceException e) {
            long latencyMs = System.currentTimeMillis() - startTime;
            String errorCode = determineErrorCode(e);
            logger.error("ai.text.generation.failed: errorCode={}, latencyMs={}, errorMessage={}", 
                errorCode, latencyMs, e.getMessage());
            
            // Record failed generation duration
            sample.stop(Timer.builder("meditation.ai.text.generation.duration")
                    .tag("ai_provider", AI_PROVIDER)
                    .tag("status", "failure")
                    .register(meterRegistry));
            
            // Increment failure counter
            Counter.builder("meditation.ai.generation.failures")
                    .tag("ai_provider", AI_PROVIDER)
                    .tag("operation", "text")
                    .tag("error_code", errorCode)
                    .register(meterRegistry)
                    .increment();
            
            throw new TextGenerationException("AI text generation failed: " + e.getMessage(), e);
        }
    }
    
    private String determineErrorCode(TextGenerationServiceException e) {
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
