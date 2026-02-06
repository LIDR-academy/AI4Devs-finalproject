package com.hexagonal.meditationbuilder.infrastructure.config;

import com.hexagonal.meditationbuilder.domain.ports.out.ImageGenerationPort;
import com.hexagonal.meditationbuilder.domain.ports.out.MediaCatalogPort;
import com.hexagonal.meditationbuilder.domain.ports.out.TextGenerationPort;
import com.hexagonal.meditationbuilder.infrastructure.out.service.ImageGenerationAiAdapter;
import com.hexagonal.meditationbuilder.infrastructure.out.service.MediaCatalogAdapter;
import com.hexagonal.meditationbuilder.infrastructure.out.service.TextGenerationAiAdapter;
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
 *   <li>aiTextRestClient - for text generation (30s timeout)</li>
 *   <li>aiImageRestClient - for image generation (60s timeout)</li>
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
         * Uses default timeouts (connect: 5000ms, read: 30000ms).
         */
        @Bean
        @Qualifier("aiTextRestClient")
        public RestClient aiTextRestClient(OpenAiProperties openAiProperties) {
                SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
                requestFactory.setConnectTimeout(5000); // default connect timeout
                requestFactory.setReadTimeout(30000);   // default read timeout

                return RestClient.builder()
                                .requestFactory(requestFactory)
                                .build();
        }

        /**
         * RestClient configured for OpenAI image generation.
         * Uses longer timeouts (connect: 5000ms, read: 60000ms).
         */
        @Bean
        @Qualifier("aiImageRestClient")
        public RestClient aiImageRestClient(OpenAiProperties openAiProperties) {
                SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
                requestFactory.setConnectTimeout(5000); // default connect timeout
                requestFactory.setReadTimeout(60000);   // longer read timeout for images

                return RestClient.builder()
                                .requestFactory(requestFactory)
                                .build();
        }

    /**
     * RestClient configured for Media Catalog service.
     */
    @Bean
    @Qualifier("mediaCatalogRestClient")
    public RestClient mediaCatalogRestClient(MediaCatalogProperties mediaCatalogProperties) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(mediaCatalogProperties.connectTimeoutMs());
        requestFactory.setReadTimeout(mediaCatalogProperties.readTimeoutMs());

        return RestClient.builder()
                .requestFactory(requestFactory)
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
                aiProperties
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
                        com.hexagonal.meditationbuilder.domain.ports.out.CompositionRepositoryPort compositionRepositoryPort,
                        java.time.Clock clock) {
                return new com.hexagonal.meditationbuilder.application.service.ComposeContentService(
                                mediaCatalogPort,
                                compositionRepositoryPort,
                                clock
                );
        }

        /**
         * GenerateTextService bean (implements GenerateTextUseCase).
         * Registers the application service as a Spring bean for controller injection.
         */
        @Bean
        public com.hexagonal.meditationbuilder.domain.ports.in.GenerateTextUseCase generateTextUseCase(
                        com.hexagonal.meditationbuilder.domain.ports.out.TextGenerationPort textGenerationPort) {
                return new com.hexagonal.meditationbuilder.application.service.GenerateTextService(textGenerationPort);
        }

                /**
         * GenerateImageService bean (implements GenerateImageUseCase).
         * Registers the application service as a Spring bean for controller injection.
         */
        @Bean
        public com.hexagonal.meditationbuilder.domain.ports.in.GenerateImageUseCase generateImageUseCase(
                        com.hexagonal.meditationbuilder.domain.ports.out.ImageGenerationPort imageGenerationPort) {
                return new com.hexagonal.meditationbuilder.application.service.GenerateImageService(imageGenerationPort);
        }
}
