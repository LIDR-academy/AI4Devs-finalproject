package com.hexagonal.meditationbuilder.infrastructure.out.service;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.domain.ports.out.ImageGenerationPort.ImageGenerationServiceException;
import com.hexagonal.meditationbuilder.infrastructure.config.AiProperties;
import com.hexagonal.meditationbuilder.infrastructure.config.OpenAiProperties;

import org.junit.jupiter.api.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Integration tests for ImageGenerationAiAdapter using WireMock.
 * 
 * Tests HTTP communication with external AI image generation service.
 * No real external services are called (no prompts or responses logged).
 */
@DisplayName("ImageGenerationAiAdapter Integration Tests")
class ImageGenerationAiAdapterIntegrationTest {

    private static WireMockServer wireMockServer;
    private ImageGenerationAiAdapter adapter;

    @BeforeAll
    static void setupServer() {
        wireMockServer = new WireMockServer(0); // Random port
        wireMockServer.start();
        WireMock.configureFor("localhost", wireMockServer.port());
    }

    @AfterAll
    static void stopServer() {
        wireMockServer.stop();
    }

    @BeforeEach
    void setUp() {
        wireMockServer.resetAll();
        // Use SimpleClientHttpRequestFactory to avoid HTTP/2 issues with WireMock
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(5000);
        RestClient restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();
        String baseUrl = "http://localhost:" + wireMockServer.port();
        AiProperties aiProperties = new AiProperties();
        aiProperties.setImageMetaprompt(""); // No metaprompt for integration test
        adapter = new ImageGenerationAiAdapter(restClient, baseUrl, "test-api-key", aiProperties, new OpenAiProperties());
    }

    @Nested
    @DisplayName("generate()")
    class GenerateTests {

        @Test
        @DisplayName("should generate image from prompt")
        void shouldGenerateImageFromPrompt() {
            stubFor(post(urlEqualTo("/v1/images/generations"))
                    .withHeader("Authorization", equalTo("Bearer test-api-key"))
                    .willReturn(aResponse()
                            .withStatus(200)
                            .withHeader("Content-Type", "application/json")
                            .withBody("""
                                    {
                                        "created": 1677652288,
                                        "data": [{
                                            "url": "https://ai-images.example.com/generated/peaceful-sunset-12345.png",
                                            "revisedPrompt": "A serene sunset over calm waters with soft orange and purple hues"
                                        }]
                                    }
                                    """)));

            ImageReference result = adapter.generate("A peaceful sunset for meditation");

            assertThat(result).isNotNull();
            assertThat(result.value()).contains("peaceful-sunset");
        }

        @Test
        @DisplayName("should throw exception when prompt is null")
        void shouldThrowExceptionWhenPromptIsNull() {
            assertThatThrownBy(() -> adapter.generate(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("prompt is required");
        }

        @Test
        @DisplayName("should throw exception when prompt is blank")
        void shouldThrowExceptionWhenPromptIsBlank() {
            assertThatThrownBy(() -> adapter.generate("   "))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("prompt is required");
        }

        @Test
        @DisplayName("should throw exception on rate limit (429)")
        void shouldThrowExceptionOnRateLimit() {
            stubFor(post(urlEqualTo("/v1/images/generations"))
                    .willReturn(aResponse()
                            .withStatus(429)
                            .withBody("{\"error\": \"Rate limit exceeded\"}")));

            assertThatThrownBy(() -> adapter.generate("test prompt"))
                    .isInstanceOf(ImageGenerationServiceException.class)
                    .hasMessageContaining("rate limit");
        }

        @Test
        @DisplayName("should throw exception on server error (503)")
        void shouldThrowExceptionOnServerError() {
            stubFor(post(urlEqualTo("/v1/images/generations"))
                    .willReturn(aResponse()
                            .withStatus(503)
                            .withBody("{\"error\": \"Service unavailable\"}")));

            assertThatThrownBy(() -> adapter.generate("test prompt"))
                    .isInstanceOf(ImageGenerationServiceException.class)
                    .hasMessageContaining("unavailable");
        }

        @Test
        @DisplayName("should throw exception on empty response")
        void shouldThrowExceptionOnEmptyResponse() {
            stubFor(post(urlEqualTo("/v1/images/generations"))
                    .willReturn(aResponse()
                            .withStatus(200)
                            .withHeader("Content-Type", "application/json")
                            .withBody("""
                                    {
                                        "created": 1677652288,
                                        "data": []
                                    }
                                    """)));

            assertThatThrownBy(() -> adapter.generate("test prompt"))
                    .isInstanceOf(ImageGenerationServiceException.class)
                    .hasMessageContaining("empty response");
        }

        @Test
        @DisplayName("should throw exception when URL is blank")
        void shouldThrowExceptionWhenUrlIsBlank() {
            stubFor(post(urlEqualTo("/v1/images/generations"))
                    .willReturn(aResponse()
                            .withStatus(200)
                            .withHeader("Content-Type", "application/json")
                            .withBody("""
                                    {
                                        "created": 1677652288,
                                        "data": [{
                                            "url": "",
                                            "revisedPrompt": "Test"
                                        }]
                                    }
                                    """)));

            assertThatThrownBy(() -> adapter.generate("test prompt"))
                    .isInstanceOf(ImageGenerationServiceException.class)
                    .hasMessageContaining("blank image URL");
        }

        @Test
        @DisplayName("should handle client error (400)")
        void shouldHandleClientError() {
            stubFor(post(urlEqualTo("/v1/images/generations"))
                    .willReturn(aResponse()
                            .withStatus(400)
                            .withBody("{\"error\": \"Invalid request\"}")));

            assertThatThrownBy(() -> adapter.generate("test prompt"))
                    .isInstanceOf(ImageGenerationServiceException.class)
                    .hasMessageContaining("request failed");
        }
    }
}
