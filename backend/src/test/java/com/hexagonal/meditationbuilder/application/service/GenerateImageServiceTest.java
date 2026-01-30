package com.hexagonal.meditationbuilder.application.service;

import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.domain.ports.in.GenerateImageUseCase.ImageGenerationException;
import com.hexagonal.meditationbuilder.domain.ports.out.ImageGenerationPort;
import com.hexagonal.meditationbuilder.domain.ports.out.ImageGenerationPort.ImageGenerationServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for GenerateImageService.
 * 
 * Tests the application service that orchestrates AI image generation.
 * Uses mocked ImageGenerationPort to isolate the service logic.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("GenerateImageService")
class GenerateImageServiceTest {

    @Mock
    private ImageGenerationPort imageGenerationPort;

    private GenerateImageService service;

    @BeforeEach
    void setUp() {
        service = new GenerateImageService(imageGenerationPort);
    }

    @Nested
    @DisplayName("generateImage()")
    class GenerateImageTests {

        @Test
        @DisplayName("should generate image from prompt")
        void shouldGenerateImageFromPrompt() {
            String prompt = "Peaceful mountain landscape with sunset";
            ImageReference expectedImage = new ImageReference("generated-image-uuid-123");
            
            when(imageGenerationPort.generate(prompt)).thenReturn(expectedImage);
            
            ImageReference result = service.generateImage(prompt);
            
            assertThat(result).isEqualTo(expectedImage);
            verify(imageGenerationPort).generate(prompt);
        }

        @Test
        @DisplayName("should throw exception when prompt is null")
        void shouldThrowExceptionWhenPromptIsNull() {
            assertThatThrownBy(() -> service.generateImage(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("prompt");
        }

        @Test
        @DisplayName("should throw exception when prompt is empty")
        void shouldThrowExceptionWhenPromptIsEmpty() {
            assertThatThrownBy(() -> service.generateImage(""))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("prompt");
        }

        @Test
        @DisplayName("should throw exception when prompt is blank")
        void shouldThrowExceptionWhenPromptIsBlank() {
            assertThatThrownBy(() -> service.generateImage("   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("prompt");
        }

        @Test
        @DisplayName("should map service exception to business exception")
        void shouldMapServiceExceptionToBusinessException() {
            String prompt = "Generate meditation image";
            
            when(imageGenerationPort.generate(prompt))
                .thenThrow(new ImageGenerationServiceException("AI service timeout"));
            
            assertThatThrownBy(() -> service.generateImage(prompt))
                .isInstanceOf(ImageGenerationException.class)
                .hasMessageContaining("AI")
                .hasCauseInstanceOf(ImageGenerationServiceException.class);
        }

        @Test
        @DisplayName("should map rate limit exception to business exception")
        void shouldMapRateLimitExceptionToBusinessException() {
            String prompt = "Generate meditation image";
            
            when(imageGenerationPort.generate(prompt))
                .thenThrow(new ImageGenerationServiceException("Rate limit exceeded"));
            
            assertThatThrownBy(() -> service.generateImage(prompt))
                .isInstanceOf(ImageGenerationException.class)
                .hasMessageContaining("AI")
                .hasCauseInstanceOf(ImageGenerationServiceException.class);
        }
    }
}
