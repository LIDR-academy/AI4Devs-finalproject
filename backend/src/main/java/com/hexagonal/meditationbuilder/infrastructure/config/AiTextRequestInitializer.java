package com.hexagonal.meditationbuilder.infrastructure.config;

import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiTextRequest;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

/**
 * Inicializa AiTextRequest con las OpenAiProperties de Spring al arrancar la app.
 * Permite usar AiTextRequest.forGeneration(system, user) sin pasar props.
 */
@Component
public class AiTextRequestInitializer {

    private final OpenAiProperties openAiProperties;

    public AiTextRequestInitializer(OpenAiProperties openAiProperties) {
        this.openAiProperties = openAiProperties;
    }

    @PostConstruct
    public void init() {
        AiTextRequest.setProperties(openAiProperties);
    }
}