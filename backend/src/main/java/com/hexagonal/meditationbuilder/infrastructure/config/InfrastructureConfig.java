package com.hexagonal.meditationbuilder.infrastructure.config;

import com.hexagonal.meditationbuilder.domain.ports.out.CompositionRepositoryPort;
import com.hexagonal.meditationbuilder.domain.ports.out.ImageGenerationPort;
import com.hexagonal.meditationbuilder.domain.ports.out.MediaCatalogPort;
import com.hexagonal.meditationbuilder.domain.ports.out.TextGenerationPort;
import com.hexagonal.meditationbuilder.infrastructure.out.service.ImageGenerationAiAdapter;
import com.hexagonal.meditationbuilder.infrastructure.out.service.MediaCatalogAdapter;
import com.hexagonal.meditationbuilder.infrastructure.out.service.TextGenerationAiAdapter;
import io.micrometer.observation.ObservationRegistry;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.web.client.RestClient;

/**
 * Infrastructure layer configuration.
 * 
 * <p>Configures all infrastructure adapters (out ports implementations)
 * with their required dependencies including REST clients and external
 * service configurations.</p>
 * 
 * <p>Uses separate RestClient beans for different services to allow
 * independent timeout configurations:</p>
 * <ul>
 *   <li>aiTextRestClient - for text generation (200s timeout)</li>
 *   <li>aiImageRestClient - for image generation (200s timeout)</li>
 *   <li>mediaCatalogRestClient - for media catalog (10s timeout)</li>
 * </ul>
 */
@Configuration
@EnableRetry
@EnableConfigurationProperties({
        OpenAiProperties.class,
        MediaCatalogProperties.class,
        RetryProperties.class,
        AiProperties.class
})
public class InfrastructureConfig {

    // ========== RestClient Beans ==========

        /**
         * RestClient configured for OpenAI text generation.
         * Uses default timeouts (connect: 5000ms, read: 200000ms).
         * Instrumented with ObservationRegistry for metrics and tracing.
         */
        @Bean
        @Qualifier("aiTextRestClient")
        public RestClient aiTextRestClient(OpenAiProperties openAiProperties, ObservationRegistry observationRegistry) {
                SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
                requestFactory.setConnectTimeout(5000); // default connect timeout
                requestFactory.setReadTimeout(200000);   // increased read timeout for longer narrations

                return RestClient.builder()
                                .requestFactory(requestFactory)
                                .observationRegistry(observationRegistry)
                                .build();
        }

        /**
         * RestClient configured for OpenAI image generation.
         * Uses longer timeouts (connect: 5000ms, read: 200000ms).
         * Instrumented with ObservationRegistry for metrics and tracing.
         */
        @Bean
        @Qualifier("aiImageRestClient")
        public RestClient aiImageRestClient(OpenAiProperties openAiProperties, ObservationRegistry observationRegistry) {
                SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
                requestFactory.setConnectTimeout(5000); // default connect timeout
                requestFactory.setReadTimeout(200000);   // longer read timeout for images

                return RestClient.builder()
                                .requestFactory(requestFactory)
                                .observationRegistry(observationRegistry)
                                .build();
        }

    /* Instrumented with ObservationRegistry for metrics and tracing.
     */
    @Bean
    @Qualifier("mediaCatalogRestClient")
    public RestClient mediaCatalogRestClient(MediaCatalogProperties mediaCatalogProperties, ObservationRegistry observationRegistry) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(mediaCatalogProperties.connectTimeoutMs());
        requestFactory.setReadTimeout(mediaCatalogProperties.readTimeoutMs());

        return RestClient.builder()
                .requestFactory(requestFactory)
                .observationRegistry(observationRegistry)
                .build();
    }

    // ========== Adapter Beans (Out Ports) ==========

    /**
     * Text generation adapter using OpenAI Chat Completions API.
     * 
     * <p>Implements {@link TextGenerationPort} for the domain layer.</p>
     */
    @Bean
    public TextGenerationPort textGenerationPort(
            @Qualifier("aiTextRestClient") RestClient restClient,
            OpenAiProperties openAiProperties,
            AiProperties aiProperties) {
        return new TextGenerationAiAdapter(
                restClient,
                openAiProperties.getBaseUrl(),
                openAiProperties.getApiKey(),
                aiProperties
        );
    }

    /**
     * Image generation adapter using OpenAI DALL-E API.
     * 
     * <p>Implements {@link ImageGenerationPort} for the domain layer.</p>
     */
    @Bean
        public ImageGenerationPort imageGenerationPort(
                @Qualifier("aiImageRestClient") RestClient restClient,
                OpenAiProperties openAiProperties,
                AiProperties aiProperties) {
        return new ImageGenerationAiAdapter(
                restClient,
                openAiProperties.getBaseUrl(),
                openAiProperties.getApiKey(),
                aiProperties,
                openAiProperties
        );
        }

    /**
     * Media catalog adapter for accessing pre-defined media assets.
     * 
     * <p>Implements {@link MediaCatalogPort} for the domain layer.</p>
     */
    @Bean
    public MediaCatalogPort mediaCatalogPort(
            @Qualifier("mediaCatalogRestClient") RestClient restClient,
            MediaCatalogProperties mediaCatalogProperties) {
        return new MediaCatalogAdapter(
                restClient,
                mediaCatalogProperties.baseUrl()
        );
    }

    /**
     * ComposeContentService bean (implements ComposeContentUseCase).
     * Registers the application service as a Spring bean for controller injection.
     */
    @Bean
    public com.hexagonal.meditationbuilder.domain.ports.in.ComposeContentUseCase composeContentUseCase(
            MediaCatalogPort mediaCatalogPort,
            CompositionRepositoryPort compositionRepositoryPort,
            java.time.Clock clock,
            io.micrometer.core.instrument.MeterRegistry meterRegistry) {
        return new com.hexagonal.meditationbuilder.application.service.ComposeContentService(
                mediaCatalogPort,
                compositionRepositoryPort,
                clock,
                meterRegistry
        );
    }

    /**
     * GenerateTextService bean (implements GenerateTextUseCase).
     * Registers the application service as a Spring bean for controller injection.
     */
    @Bean
    public com.hexagonal.meditationbuilder.domain.ports.in.GenerateTextUseCase generateTextUseCase(
            com.hexagonal.meditationbuilder.domain.ports.out.TextGenerationPort textGenerationPort,
            io.micrometer.core.instrument.MeterRegistry meterRegistry) {
        return new com.hexagonal.meditationbuilder.application.service.GenerateTextService(textGenerationPort, meterRegistry);
    }

    /**
     * GenerateImageService bean (implements GenerateImageUseCase).
     * Registers the application service as a Spring bean for controller injection.
     */
    @Bean
    public com.hexagonal.meditationbuilder.domain.ports.in.GenerateImageUseCase generateImageUseCase(
            com.hexagonal.meditationbuilder.domain.ports.out.ImageGenerationPort imageGenerationPort,
            io.micrometer.core.instrument.MeterRegistry meterRegistry) {
        return new com.hexagonal.meditationbuilder.application.service.GenerateImageService(imageGenerationPort, meterRegistry);
    }
}
