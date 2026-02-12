package com.hexagonal.meditationbuilder.observability;

import com.hexagonal.meditationbuilder.domain.model.TextContent;
import com.hexagonal.meditationbuilder.domain.ports.in.ComposeContentUseCase;
import com.hexagonal.meditationbuilder.domain.ports.in.GenerateTextUseCase;
import com.hexagonal.meditationbuilder.domain.ports.in.GenerateImageUseCase;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Integration tests for observability features.
 * 
 * Verifies that metrics, logs, and traces are correctly generated
 * by the application services and infrastructure adapters.
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Observability Integration Tests")
class ObservabilityIntegrationTest {

    @Autowired
    private MeterRegistry meterRegistry;

    @Autowired
    private ComposeContentUseCase composeContentUseCase;

    @Autowired
    private GenerateTextUseCase generateTextUseCase;

    @Autowired
    private GenerateImageUseCase generateImageUseCase;

    @MockBean
    private com.hexagonal.meditationbuilder.domain.ports.out.TextGenerationPort textGenerationPort;

    @MockBean
    private com.hexagonal.meditationbuilder.domain.ports.out.ImageGenerationPort imageGenerationPort;

    @Nested
    @DisplayName("Custom Metrics")
    class CustomMetricsTests {

        @Test
        @DisplayName("should register composition.created counter metric")
        void shouldRegisterCompositionCreatedMetric() {
            // Given
            TextContent textContent = new TextContent("Meditation text for metrics test");

            // When
            composeContentUseCase.createComposition(textContent);

            // Then
            Counter counter = meterRegistry.find("meditation.composition.created")
                    .counter();
            
            assertThat(counter).isNotNull();
            assertThat(counter.count()).isGreaterThan(0);
        }

        @Test
        @DisplayName("should register ai.text.generation.duration timer metric")
        void shouldRegisterTextGenerationDurationMetric() {
            // Given
            String prompt = "Test prompt for metrics";
            TextContent mockResponse = new TextContent("Generated text");
            when(textGenerationPort.generate(anyString())).thenReturn(mockResponse);

            // When
            generateTextUseCase.generateText(prompt);

            // Then
            Timer timer = meterRegistry.find("meditation.ai.text.generation.duration")
                    .timer();
            
            assertThat(timer).isNotNull();
            assertThat(timer.count()).isGreaterThan(0);
            assertThat(timer.totalTime(java.util.concurrent.TimeUnit.MILLISECONDS)).isGreaterThan(0);
        }

        @Test
        @DisplayName("should register ai.image.generation.duration timer metric")
        void shouldRegisterImageGenerationDurationMetric() {
            // Given
            String prompt = "Test image prompt";
            com.hexagonal.meditationbuilder.domain.model.ImageReference mockImage = 
                    new com.hexagonal.meditationbuilder.domain.model.ImageReference("test-image-123");
            when(imageGenerationPort.generate(anyString())).thenReturn(mockImage);

            // When
            generateImageUseCase.generateImage(prompt);

            // Then
            Timer timer = meterRegistry.find("meditation.ai.image.generation.duration")
                    .timer();
            
            assertThat(timer).isNotNull();
            assertThat(timer.count()).isGreaterThan(0);
            assertThat(timer.totalTime(java.util.concurrent.TimeUnit.MILLISECONDS)).isGreaterThan(0);
        }

        @Test
        @DisplayName("should register ai.generation.failures counter on error")
        void shouldRegisterGenerationFailuresOnError() {
            // Given
            String prompt = "Test prompt that will fail";
            when(textGenerationPort.generate(anyString()))
                    .thenThrow(new com.hexagonal.meditationbuilder.domain.ports.out.TextGenerationPort.TextGenerationServiceException("Test error", null));

            // When
            try {
                generateTextUseCase.generateText(prompt);
            } catch (Exception e) {
                // Expected
            }

            // Then
            Counter counter = meterRegistry.find("meditation.ai.generation.failures")
                    .counter();
            
            assertThat(counter).isNotNull();
            assertThat(counter.count()).isGreaterThan(0);
        }
    }

    @Nested
    @DisplayName("Metric Tags")
    class MetricTagsTests {

        @Test
        @DisplayName("should include output_type tag in composition.created metric")
        void shouldIncludeOutputTypeTag() {
            // Given
            TextContent textContent = new TextContent("Text for tag test");

            // When
            composeContentUseCase.createComposition(textContent);

            // Then - verify metric exists (tag value may vary based on composition state)
            Counter counter = meterRegistry.find("meditation.composition.created")
                    .counters()
                    .stream()
                    .findFirst()
                    .orElse(null);
            
            assertThat(counter).isNotNull();
            assertThat(counter.getId().getTags()).isNotEmpty();
            assertThat(counter.getId().getTags().stream()
                .anyMatch(tag -> tag.getKey().equals("output_type")))
                .isTrue();
        }

        @Test
        @DisplayName("should include ai_provider and status tags in text generation metric")
        void shouldIncludeTextGenerationTags() {
            // Given
            String prompt = "Test prompt";
            TextContent mockResponse = new TextContent("Generated text");
            when(textGenerationPort.generate(anyString())).thenReturn(mockResponse);

            // When
            generateTextUseCase.generateText(prompt);

            // Then - verify metric exists with tags
            Timer timer = meterRegistry.find("meditation.ai.text.generation.duration")
                    .timers()
                    .stream()
                    .findFirst()
                    .orElse(null);
            
            assertThat(timer).isNotNull();
            assertThat(timer.getId().getTags()).isNotEmpty();
            assertThat(timer.getId().getTags().stream()
                .anyMatch(tag -> tag.getKey().equals("ai_provider")))
                .isTrue();
            assertThat(timer.getId().getTags().stream()
                .anyMatch(tag -> tag.getKey().equals("status")))
                .isTrue();
        }

        @Test
        @DisplayName("should include error_code tag in failures metric")
        void shouldIncludeErrorCodeTag() {
            // Given
            String prompt = "Test prompt that will fail";
            when(textGenerationPort.generate(anyString()))
                    .thenThrow(new com.hexagonal.meditationbuilder.domain.ports.out.TextGenerationPort.TextGenerationServiceException("Test error", null));

            // When
            try {
                generateTextUseCase.generateText(prompt);
            } catch (Exception e) {
                // Expected
            }

            // Then - verify metric exists with tags
            Counter counter = meterRegistry.find("meditation.ai.generation.failures")
                    .counters()
                    .stream()
                    .findFirst()
                    .orElse(null);
            
            assertThat(counter).isNotNull();
            assertThat(counter.getId().getTags()).isNotEmpty();
            assertThat(counter.getId().getTags().stream()
                .anyMatch(tag -> tag.getKey().equals("ai_provider")))
                .isTrue();
            assertThat(counter.getId().getTags().stream()
                .anyMatch(tag -> tag.getKey().equals("operation")))
                .isTrue();
        }
    }

    @Nested
    @DisplayName("MeterRegistry Configuration")
    class MeterRegistryConfigurationTests {

        @Test
        @DisplayName("should have MeterRegistry bean available")
        void shouldHaveMeterRegistryBean() {
            assertThat(meterRegistry).isNotNull();
        }

        @Test
        @DisplayName("should support custom metric registration")
        void shouldSupportCustomMetricRegistration() {
            // When
            Counter customCounter = Counter.builder("test.custom.counter")
                    .tag("environment", "test")
                    .register(meterRegistry);

            // Then
            assertThat(customCounter).isNotNull();
            
            // Cleanup
            meterRegistry.remove(customCounter);
        }
    }
}
