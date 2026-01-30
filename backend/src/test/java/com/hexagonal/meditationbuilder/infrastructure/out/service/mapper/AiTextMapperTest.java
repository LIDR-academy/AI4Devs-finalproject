package com.hexagonal.meditationbuilder.infrastructure.out.service.mapper;

import com.hexagonal.meditationbuilder.domain.model.TextContent;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiTextRequest;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiTextResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for AiTextMapper.
 */
@DisplayName("AiTextMapper")
class AiTextMapperTest {

    @Nested
    @DisplayName("toGenerationRequest()")
    class ToGenerationRequestTests {

        @Test
        @DisplayName("should create generation request with system and user prompts")
        void shouldCreateGenerationRequest() {
            AiTextRequest request = AiTextMapper.toGenerationRequest(
                    "You are a meditation writer",
                    "Write about peace"
            );

            assertThat(request).isNotNull();
            assertThat(request.messages()).hasSize(2);
            assertThat(request.messages().get(0).role()).isEqualTo("system");
            assertThat(request.messages().get(0).content()).isEqualTo("You are a meditation writer");
            assertThat(request.messages().get(1).role()).isEqualTo("user");
            assertThat(request.messages().get(1).content()).isEqualTo("Write about peace");
        }
    }

    @Nested
    @DisplayName("toEnhancementRequest()")
    class ToEnhancementRequestTests {

        @Test
        @DisplayName("should create enhancement request with text to enhance")
        void shouldCreateEnhancementRequest() {
            TextContent text = new TextContent("Original meditation text");
            AiTextRequest request = AiTextMapper.toEnhancementRequest(
                    "You are an editor",
                    text
            );

            assertThat(request).isNotNull();
            assertThat(request.messages()).hasSize(2);
            assertThat(request.messages().get(0).role()).isEqualTo("system");
            assertThat(request.messages().get(1).role()).isEqualTo("user");
            assertThat(request.messages().get(1).content()).contains("Original meditation text");
        }
    }

    @Nested
    @DisplayName("fromResponse()")
    class FromResponseTests {

        @Test
        @DisplayName("should extract TextContent from valid response")
        void shouldExtractTextContentFromValidResponse() {
            AiTextResponse response = new AiTextResponse(
                    "chatcmpl-123",
                    "chat.completion",
                    1677652288L,
                    "gpt-4o-mini",
                    List.of(new AiTextResponse.Choice(
                            0,
                            new AiTextResponse.Message("assistant", "Generated meditation text"),
                            "stop"
                    )),
                    new AiTextResponse.Usage(50, 20, 70)
            );

            TextContent result = AiTextMapper.fromResponse(response);

            assertThat(result).isNotNull();
            assertThat(result.value()).isEqualTo("Generated meditation text");
        }

        @Test
        @DisplayName("should trim whitespace from response content")
        void shouldTrimWhitespace() {
            AiTextResponse response = new AiTextResponse(
                    "chatcmpl-123",
                    "chat.completion",
                    1677652288L,
                    "gpt-4o-mini",
                    List.of(new AiTextResponse.Choice(
                            0,
                            new AiTextResponse.Message("assistant", "  Text with spaces  "),
                            "stop"
                    )),
                    null
            );

            TextContent result = AiTextMapper.fromResponse(response);

            assertThat(result.value()).isEqualTo("Text with spaces");
        }

        @Test
        @DisplayName("should throw exception when response is null")
        void shouldThrowExceptionWhenResponseIsNull() {
            assertThatThrownBy(() -> AiTextMapper.fromResponse(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("response is required");
        }

        @Test
        @DisplayName("should throw exception when choices is null")
        void shouldThrowExceptionWhenChoicesIsNull() {
            AiTextResponse response = new AiTextResponse(
                    "chatcmpl-123", "chat.completion", 1677652288L,
                    "gpt-4o-mini", null, null
            );

            assertThatThrownBy(() -> AiTextMapper.fromResponse(response))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("no choices");
        }

        @Test
        @DisplayName("should throw exception when choices is empty")
        void shouldThrowExceptionWhenChoicesIsEmpty() {
            AiTextResponse response = new AiTextResponse(
                    "chatcmpl-123", "chat.completion", 1677652288L,
                    "gpt-4o-mini", List.of(), null
            );

            assertThatThrownBy(() -> AiTextMapper.fromResponse(response))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("no choices");
        }

        @Test
        @DisplayName("should throw exception when content is blank")
        void shouldThrowExceptionWhenContentIsBlank() {
            AiTextResponse response = new AiTextResponse(
                    "chatcmpl-123",
                    "chat.completion",
                    1677652288L,
                    "gpt-4o-mini",
                    List.of(new AiTextResponse.Choice(
                            0,
                            new AiTextResponse.Message("assistant", "   "),
                            "stop"
                    )),
                    null
            );

            assertThatThrownBy(() -> AiTextMapper.fromResponse(response))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("content is blank");
        }
    }

    @Nested
    @DisplayName("isSuccessful()")
    class IsSuccessfulTests {

        @Test
        @DisplayName("should return true when finish reason is stop")
        void shouldReturnTrueWhenFinishReasonIsStop() {
            AiTextResponse response = new AiTextResponse(
                    "chatcmpl-123",
                    "chat.completion",
                    1677652288L,
                    "gpt-4o-mini",
                    List.of(new AiTextResponse.Choice(
                            0,
                            new AiTextResponse.Message("assistant", "Text"),
                            "stop"
                    )),
                    null
            );

            assertThat(AiTextMapper.isSuccessful(response)).isTrue();
        }

        @Test
        @DisplayName("should return false when finish reason is not stop")
        void shouldReturnFalseWhenFinishReasonIsNotStop() {
            AiTextResponse response = new AiTextResponse(
                    "chatcmpl-123",
                    "chat.completion",
                    1677652288L,
                    "gpt-4o-mini",
                    List.of(new AiTextResponse.Choice(
                            0,
                            new AiTextResponse.Message("assistant", "Text"),
                            "length"
                    )),
                    null
            );

            assertThat(AiTextMapper.isSuccessful(response)).isFalse();
        }

        @Test
        @DisplayName("should return false when response is null")
        void shouldReturnFalseWhenResponseIsNull() {
            assertThat(AiTextMapper.isSuccessful(null)).isFalse();
        }
    }

    @Nested
    @DisplayName("getTotalTokens()")
    class GetTotalTokensTests {

        @Test
        @DisplayName("should return total tokens from usage")
        void shouldReturnTotalTokens() {
            AiTextResponse response = new AiTextResponse(
                    "chatcmpl-123",
                    "chat.completion",
                    1677652288L,
                    "gpt-4o-mini",
                    List.of(),
                    new AiTextResponse.Usage(50, 20, 70)
            );

            assertThat(AiTextMapper.getTotalTokens(response)).isEqualTo(70);
        }

        @Test
        @DisplayName("should return zero when usage is null")
        void shouldReturnZeroWhenUsageIsNull() {
            AiTextResponse response = new AiTextResponse(
                    "chatcmpl-123", "chat.completion", 1677652288L,
                    "gpt-4o-mini", List.of(), null
            );

            assertThat(AiTextMapper.getTotalTokens(response)).isZero();
        }

        @Test
        @DisplayName("should return zero when response is null")
        void shouldReturnZeroWhenResponseIsNull() {
            assertThat(AiTextMapper.getTotalTokens(null)).isZero();
        }
    }
}
