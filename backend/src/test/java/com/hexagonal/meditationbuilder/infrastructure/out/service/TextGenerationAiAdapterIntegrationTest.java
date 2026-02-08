package com.hexagonal.meditationbuilder.infrastructure.out.service;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.hexagonal.meditationbuilder.domain.model.TextContent;
import com.hexagonal.meditationbuilder.domain.ports.out.TextGenerationPort.TextGenerationServiceException;
import com.hexagonal.meditationbuilder.infrastructure.config.AiProperties;
import com.hexagonal.meditationbuilder.infrastructure.config.OpenAiProperties;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiTextRequest;
import org.junit.jupiter.api.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Integration tests for TextGenerationAiAdapter using WireMock.
 * 
 * Tests HTTP communication with external AI text generation service.
 * No real external services are called (no prompts or responses logged).
 */
@DisplayName("TextGenerationAiAdapter Integration Tests")
class TextGenerationAiAdapterIntegrationTest {

    @BeforeAll
    static void initAiTextRequestProps() {
        OpenAiProperties props = new OpenAiProperties();
        props.setModel("gpt-4o-mini");
        props.setApiKey("test-api-key");
        props.setBaseUrl("http://localhost");
        props.setTemperature(0.7);
        props.setMaxTokens(256);
        props.setTopP(1.0);
        props.setFrequencyPenalty(0.0);
        props.setPresencePenalty(0.0);
        AiTextRequest.setProperties(props);
    }

    private static WireMockServer wireMockServer;
    private TextGenerationAiAdapter adapter;

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
        aiProperties.setTextMetaprompt(""); // No metaprompt for integration test
        adapter = new TextGenerationAiAdapter(restClient, baseUrl, "test-api-key", aiProperties);
    }

    @Nested
    @DisplayName("generate()")
    class GenerateTests {

        @Test
        @DisplayName("should generate text from prompt")
        void shouldGenerateTextFromPrompt() {
            stubFor(post(urlEqualTo("/v1/chat/completions"))
                    .withHeader("Authorization", equalTo("Bearer test-api-key"))
                    .willReturn(aResponse()
                            .withStatus(200)
                            .withHeader("Content-Type", "application/json")
                            .withBody("""
                                    {
                                        "id": "chatcmpl-123",
                                        "object": "chat.completion",
                                        "created": 1677652288,
                                        "model": "gpt-4o-mini",
                                        "choices": [{
                                            "index": 0,
                                            "message": {
                                                "role": "assistant",
                                                "content": "Close your eyes and take a deep breath. Feel the calm washing over you."
                                            },
                                            "finishReason": "stop"
                                        }],
                                        "usage": {
                                            "promptTokens": 50,
                                            "completionTokens": 20,
                                            "totalTokens": 70
                                        }
                                    }
                                    """)));

            TextContent result = adapter.generate("Create a calming meditation about peace");

            assertThat(result).isNotNull();
            assertThat(result.value()).contains("Close your eyes");
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
            stubFor(post(urlEqualTo("/v1/chat/completions"))
                    .willReturn(aResponse()
                            .withStatus(429)
                            .withBody("{\"error\": \"Rate limit exceeded\"}")));

            assertThatThrownBy(() -> adapter.generate("test prompt"))
                    .isInstanceOf(TextGenerationServiceException.class)
                    .hasMessageContaining("rate limit");
        }

        @Test
        @DisplayName("should throw exception on server error (503)")
        void shouldThrowExceptionOnServerError() {
            stubFor(post(urlEqualTo("/v1/chat/completions"))
                    .willReturn(aResponse()
                            .withStatus(503)
                            .withBody("{\"error\": \"Service unavailable\"}")));

            assertThatThrownBy(() -> adapter.generate("test prompt"))
                    .isInstanceOf(TextGenerationServiceException.class)
                    .hasMessageContaining("unavailable");
        }

        @Test
        @DisplayName("should throw exception on empty response")
        void shouldThrowExceptionOnEmptyResponse() {
            stubFor(post(urlEqualTo("/v1/chat/completions"))
                    .willReturn(aResponse()
                            .withStatus(200)
                            .withHeader("Content-Type", "application/json")
                            .withBody("""
                                    {
                                        "id": "chatcmpl-123",
                                        "choices": []
                                    }
                                    """)));

            assertThatThrownBy(() -> adapter.generate("test prompt"))
                    .isInstanceOf(TextGenerationServiceException.class)
                    .hasMessageContaining("empty response");
        }
    }

    // Tests de enhance eliminados: solo se prueba generate
}
