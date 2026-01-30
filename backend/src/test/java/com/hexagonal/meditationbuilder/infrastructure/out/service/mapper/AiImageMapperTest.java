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
            assertThat(request.quality()).isEqualTo("standard");
        }
    }

    @Nested
    @DisplayName("toHighQualityRequest()")
    class ToHighQualityRequestTests {

        @Test
        @DisplayName("should create HD quality request")
        void shouldCreateHdQualityRequest() {
            AiImageRequest request = AiImageMapper.toHighQualityRequest("Mountain landscape");

            assertThat(request).isNotNull();
            assertThat(request.prompt()).isEqualTo("Mountain landscape");
            assertThat(request.quality()).isEqualTo("hd");
        }
    }

    @Nested
    @DisplayName("toCustomRequest()")
    class ToCustomRequestTests {

        @Test
        @DisplayName("should create custom size request")
        void shouldCreateCustomSizeRequest() {
            AiImageRequest request = AiImageMapper.toCustomRequest(
                    "Wide landscape",
                    "1792x1024",
                    false
            );

            assertThat(request.size()).isEqualTo("1792x1024");
            assertThat(request.quality()).isEqualTo("standard");
        }

        @Test
        @DisplayName("should create custom HD request")
        void shouldCreateCustomHdRequest() {
            AiImageRequest request = AiImageMapper.toCustomRequest(
                    "Portrait",
                    "1024x1792",
                    true
            );

            assertThat(request.size()).isEqualTo("1024x1792");
            assertThat(request.quality()).isEqualTo("hd");
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
                    List.of(new AiImageResponse.ImageData(
                            "https://example.com/image.png",
                            "A serene sunset",
                            null
                    ))
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
            AiImageResponse response = new AiImageResponse(1677652288L, null);

            assertThatThrownBy(() -> AiImageMapper.fromResponse(response))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("no data");
        }

        @Test
        @DisplayName("should throw exception when data is empty")
        void shouldThrowExceptionWhenDataIsEmpty() {
            AiImageResponse response = new AiImageResponse(1677652288L, List.of());

            assertThatThrownBy(() -> AiImageMapper.fromResponse(response))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("no data");
        }

        @Test
        @DisplayName("should throw exception when URL is blank")
        void shouldThrowExceptionWhenUrlIsBlank() {
            AiImageResponse response = new AiImageResponse(
                    1677652288L,
                    List.of(new AiImageResponse.ImageData("   ", null, null))
            );

            assertThatThrownBy(() -> AiImageMapper.fromResponse(response))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("no image URL");
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
                    List.of(new AiImageResponse.ImageData(
                            "https://example.com/image.png",
                            "Enhanced: A serene sunset with calm waters",
                            null
                    ))
            );

            String result = AiImageMapper.getRevisedPrompt(response);

            assertThat(result).isEqualTo("Enhanced: A serene sunset with calm waters");
        }

        @Test
        @DisplayName("should return null when revised prompt not available")
        void shouldReturnNullWhenNotAvailable() {
            AiImageResponse response = new AiImageResponse(
                    1677652288L,
                    List.of(new AiImageResponse.ImageData(
                            "https://example.com/image.png",
                            null,
                            null
                    ))
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
                    List.of(new AiImageResponse.ImageData(
                            null,
                            null,
                            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                    ))
            );

            assertThat(AiImageMapper.hasBase64Image(response)).isTrue();
        }

        @Test
        @DisplayName("should return false when no base64 image")
        void shouldReturnFalseWhenNoBase64() {
            AiImageResponse response = new AiImageResponse(
                    1677652288L,
                    List.of(new AiImageResponse.ImageData(
                            "https://example.com/image.png",
                            null,
                            null
                    ))
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
                    List.of(new AiImageResponse.ImageData(null, null, base64))
            );

            assertThat(AiImageMapper.getBase64Image(response)).isEqualTo(base64);
        }

        @Test
        @DisplayName("should return null when no base64 image")
        void shouldReturnNullWhenNoBase64() {
            AiImageResponse response = new AiImageResponse(
                    1677652288L,
                    List.of(new AiImageResponse.ImageData("url", null, null))
            );

            assertThat(AiImageMapper.getBase64Image(response)).isNull();
        }
    }
}
