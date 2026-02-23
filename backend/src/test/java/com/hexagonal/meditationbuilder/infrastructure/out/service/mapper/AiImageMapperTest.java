package com.hexagonal.meditationbuilder.infrastructure.out.service.mapper;

import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiImageRequest;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiImageResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for AiImageMapper.
 */
@DisplayName("AiImageMapper")
class AiImageMapperTest {

    @Nested
    @DisplayName("toRequest()")
    class ToRequestTests {

        @Test
        @DisplayName("should create standard quality request")
        void shouldCreateStandardQualityRequest() {
            AiImageRequest request = AiImageMapper.toRequest("A peaceful sunset");

            assertThat(request).isNotNull();
            assertThat(request.prompt()).isEqualTo("A peaceful sunset");
            assertThat(request.n()).isEqualTo(1);
            assertThat(request.size()).isEqualTo("1024x1024");
            // El valor por defecto en el mapper es "low" (no "standard")
            assertThat(request.quality()).isEqualTo("low");
            assertThat(request.outputFormat()).isNull();
            assertThat(request.background()).isNull();
            assertThat(request.responseFormat()).isEqualTo("url");
        }
    }

    @Nested
    @DisplayName("toHighQualityRequest()")
    class ToHighQualityRequestTests {

        @Test
        @DisplayName("should create high quality request")
        void shouldCreateHighQualityRequest() {
            AiImageRequest request = AiImageMapper.toHighQualityRequest("Mountain landscape");

            assertThat(request).isNotNull();
            assertThat(request.prompt()).isEqualTo("Mountain landscape");
            // El valor por defecto en el mapper es "high" (no "hd")
            assertThat(request.quality()).isEqualTo("high");
            assertThat(request.outputFormat()).isNull();
            assertThat(request.background()).isNull();
            assertThat(request.responseFormat()).isEqualTo("url");
        }
    }

    @Nested
    @DisplayName("fromResponse()")
    class FromResponseTests {

        @Test
        @DisplayName("should extract ImageReference from valid response")
        void shouldExtractImageReferenceFromValidResponse() {
            AiImageResponse response = new AiImageResponse(
                1677652288L,
                null, // background
                null, // outputFormat
                null, // quality
                null, // size
                List.of(new AiImageResponse.ImageData(
                    "https://example.com/image.png",
                    null,
                    null
                )),
                null, // usage
                null  // error
            );

            ImageReference result = AiImageMapper.fromResponse(response);

            assertThat(result).isNotNull();
            assertThat(result.value()).isEqualTo("https://example.com/image.png");
        }

        @Test
        @DisplayName("should throw exception when response is null")
        void shouldThrowExceptionWhenResponseIsNull() {
            assertThatThrownBy(() -> AiImageMapper.fromResponse(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("response is required");
        }

        @Test
        @DisplayName("should throw exception when data is null")
        void shouldThrowExceptionWhenDataIsNull() {
            AiImageResponse response = new AiImageResponse(
                1677652288L,
                null, null, null, null,
                null, // data
                null, null
            );

            assertThatThrownBy(() -> AiImageMapper.fromResponse(response))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("no data");
        }

        @Test
        @DisplayName("should throw exception when data is empty")
        void shouldThrowExceptionWhenDataIsEmpty() {
            AiImageResponse response = new AiImageResponse(
                1677652288L,
                null, null, null, null,
                List.of(),
                null, null
            );

            assertThatThrownBy(() -> AiImageMapper.fromResponse(response))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("no data");
        }

        @Test
        @DisplayName("should throw exception when URL is blank")
        void shouldThrowExceptionWhenUrlIsBlank() {
            AiImageResponse response = new AiImageResponse(
                1677652288L,
                null, null, null, null,
                List.of(new AiImageResponse.ImageData("   ", null, null)),
                null, null
            );

            assertThatThrownBy(() -> AiImageMapper.fromResponse(response))
                .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("neither image URL nor base64");
        }
    }

    @Nested
    @DisplayName("getRevisedPrompt()")
    class GetRevisedPromptTests {

        @Test
        @DisplayName("should return revised prompt when available")
        void shouldReturnRevisedPrompt() {
            AiImageResponse response = new AiImageResponse(
                1677652288L,
                null, null, null, null,
                List.of(new AiImageResponse.ImageData(
                    "https://example.com/image.png",
                    null,  // b64Json
                    "Enhanced: A serene sunset with calm waters"  // revisedPrompt
                )),
                null, null
            );

            String result = AiImageMapper.getRevisedPrompt(response);

            assertThat(result).isEqualTo("Enhanced: A serene sunset with calm waters");
        }

        @Test
        @DisplayName("should return null when revised prompt not available")
        void shouldReturnNullWhenNotAvailable() {
            AiImageResponse response = new AiImageResponse(
                1677652288L,
                null, null, null, null,
                List.of(new AiImageResponse.ImageData(
                    "https://example.com/image.png",
                    null,
                    null
                )),
                null, null
            );

            assertThat(AiImageMapper.getRevisedPrompt(response)).isNull();
        }

        @Test
        @DisplayName("should return null when response is null")
        void shouldReturnNullWhenResponseIsNull() {
            assertThat(AiImageMapper.getRevisedPrompt(null)).isNull();
        }
    }

    @Nested
    @DisplayName("hasBase64Image()")
    class HasBase64ImageTests {

        @Test
        @DisplayName("should return true when base64 image exists")
        void shouldReturnTrueWhenBase64Exists() {
            AiImageResponse response = new AiImageResponse(
                1677652288L,
                null, null, null, null,
                List.of(new AiImageResponse.ImageData(
                    null,
                    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
                    null
                )),
                null, null
            );

            assertThat(AiImageMapper.hasBase64Image(response)).isTrue();
        }

        @Test
        @DisplayName("should return false when no base64 image")
        void shouldReturnFalseWhenNoBase64() {
            AiImageResponse response = new AiImageResponse(
                1677652288L,
                null, null, null, null,
                List.of(new AiImageResponse.ImageData(
                    "https://example.com/image.png",
                    null,
                    null
                )),
                null, null
            );

            assertThat(AiImageMapper.hasBase64Image(response)).isFalse();
        }

        @Test
        @DisplayName("should return false when response is null")
        void shouldReturnFalseWhenResponseIsNull() {
            assertThat(AiImageMapper.hasBase64Image(null)).isFalse();
        }
    }

    @Nested
    @DisplayName("getBase64Image()")
    class GetBase64ImageTests {

        @Test
        @DisplayName("should return base64 image when available")
        void shouldReturnBase64Image() {
            String base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAY=";
            AiImageResponse response = new AiImageResponse(
                1677652288L,
                null, null, null, null,
                List.of(new AiImageResponse.ImageData(null, base64, null)),
                null, null
            );

            assertThat(AiImageMapper.getBase64Image(response)).isEqualTo(base64);
        }

        @Test
        @DisplayName("should return null when no base64 image")
        void shouldReturnNullWhenNoBase64() {
            AiImageResponse response = new AiImageResponse(
                1677652288L,
                null, null, null, null,
                List.of(new AiImageResponse.ImageData("url", null, null)),
                null, null
            );

            assertThat(AiImageMapper.getBase64Image(response)).isNull();
        }
    }
}
