package com.hexagonal.meditationbuilder.application.service;

import com.hexagonal.meditationbuilder.domain.model.TextContent;
import com.hexagonal.meditationbuilder.domain.ports.in.GenerateTextUseCase.TextGenerationException;
import com.hexagonal.meditationbuilder.domain.ports.out.TextGenerationPort;
import com.hexagonal.meditationbuilder.domain.ports.out.TextGenerationPort.TextGenerationServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for GenerateTextService.
 * 
 * Tests the application service that orchestrates AI text generation.
 * Uses mocked TextGenerationPort to isolate the service logic.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("GenerateTextService")
class GenerateTextServiceTest {

    @Mock
    private TextGenerationPort textGenerationPort;

    private GenerateTextService service;

    @BeforeEach
    void setUp() {
        service = new GenerateTextService(textGenerationPort);
    }

    @Nested
    @DisplayName("generateText()")
    class GenerateTextTests {

        @Test
        @DisplayName("should generate text from prompt")
        void shouldGenerateTextFromPrompt() {
            String prompt = "Create a relaxing meditation about nature";
            TextContent expectedText = new TextContent("Generated meditation text about nature...");
            
            when(textGenerationPort.generate(prompt)).thenReturn(expectedText);
            
            TextContent result = service.generateText(prompt);
            
            assertThat(result).isEqualTo(expectedText);
            verify(textGenerationPort).generate(prompt);
        }

        @Test
        @DisplayName("should throw exception when prompt is null")
        void shouldThrowExceptionWhenPromptIsNull() {
            assertThatThrownBy(() -> service.generateText(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("prompt");
        }

        @Test
        @DisplayName("should throw exception when prompt is empty")
        void shouldThrowExceptionWhenPromptIsEmpty() {
            assertThatThrownBy(() -> service.generateText(""))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("prompt");
        }

        @Test
        @DisplayName("should throw exception when prompt is blank")
        void shouldThrowExceptionWhenPromptIsBlank() {
            assertThatThrownBy(() -> service.generateText("   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("prompt");
        }

        @Test
        @DisplayName("should map service exception to business exception")
        void shouldMapServiceExceptionToBusinessException() {
            String prompt = "Create meditation";
            
            when(textGenerationPort.generate(prompt))
                .thenThrow(new TextGenerationServiceException("AI service timeout"));
            
            assertThatThrownBy(() -> service.generateText(prompt))
                .isInstanceOf(TextGenerationException.class)
                .hasMessageContaining("AI")
                .hasCauseInstanceOf(TextGenerationServiceException.class);
        }
    }

    @Nested
    @DisplayName("enhanceText()")
    class EnhanceTextTests {

        @Test
        @DisplayName("should enhance existing text")
        void shouldEnhanceExistingText() {
            TextContent currentText = new TextContent("Simple meditation text");
            TextContent enhancedText = new TextContent("Enhanced and improved meditation text with better flow...");
            
            when(textGenerationPort.enhance(currentText)).thenReturn(enhancedText);
            
            TextContent result = service.enhanceText(currentText);
            
            assertThat(result).isEqualTo(enhancedText);
            verify(textGenerationPort).enhance(currentText);
        }

        @Test
        @DisplayName("should throw exception when current text is null")
        void shouldThrowExceptionWhenCurrentTextIsNull() {
            assertThatThrownBy(() -> service.enhanceText(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("currentText");
        }

        @Test
        @DisplayName("should map service exception to business exception")
        void shouldMapServiceExceptionToBusinessException() {
            TextContent currentText = new TextContent("Text to enhance");
            
            when(textGenerationPort.enhance(currentText))
                .thenThrow(new TextGenerationServiceException("Rate limit exceeded"));
            
            assertThatThrownBy(() -> service.enhanceText(currentText))
                .isInstanceOf(TextGenerationException.class)
                .hasMessageContaining("AI")
                .hasCauseInstanceOf(TextGenerationServiceException.class);
        }
    }
}
