package com.hexagonal.meditation.generation.infrastructure.in.rest.mapper;

import com.hexagonal.meditation.generation.domain.enums.GenerationStatus;
import com.hexagonal.meditation.generation.domain.enums.MediaType;
import com.hexagonal.meditation.generation.domain.model.MediaReference;
import com.hexagonal.meditation.generation.domain.model.MeditationOutput;
import com.hexagonal.meditation.generation.infrastructure.in.rest.dto.GenerationResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("MeditationOutputDtoMapper Tests")
class MeditationOutputDtoMapperTest {

    private static final Instant FIXED_NOW = Instant.parse("2026-01-01T00:00:00Z");

    private MeditationOutputDtoMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new MeditationOutputDtoMapper();
    }

    @Nested
    @DisplayName("toGenerationResponse")
    class ToGenerationResponse {

        @Test
        @DisplayName("should map completed VIDEO output with all fields")
        void shouldMapCompletedVideoOutputWithAllFields() {
            // Given
            UUID meditationId = UUID.randomUUID();
            UUID compositionId = UUID.randomUUID();
            UUID userId = UUID.randomUUID();
            Instant now = FIXED_NOW;

            MeditationOutput output = new MeditationOutput(
                    meditationId,
                    compositionId,
                    userId,
                    MediaType.VIDEO,
                    "Test meditation text",
                    new MediaReference("calm-music"),
                    new MediaReference("peaceful-image"),
                    "idempotency-key-123",
                    "https://s3.amazonaws.com/meditation-outputs/generation/user-123/video.mp4",
                    "https://s3.amazonaws.com/meditation-outputs/generation/user-123/subs.srt",
                    180,
                    GenerationStatus.COMPLETED,
                    now,
                    now
            );

            // When
            GenerationResponse response = mapper.toGenerationResponse(output);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.meditationId()).isEqualTo(meditationId);
            assertThat(response.type()).isEqualTo("VIDEO");
            assertThat(response.mediaUrl()).isEqualTo("https://s3.amazonaws.com/meditation-outputs/generation/user-123/video.mp4");
            assertThat(response.subtitleUrl()).isEqualTo("https://s3.amazonaws.com/meditation-outputs/generation/user-123/subs.srt");
            assertThat(response.durationSeconds()).isEqualTo(180);
            assertThat(response.status()).isEqualTo("COMPLETED");
            assertThat(response.message()).isEqualTo("Generation completed successfully");
        }

        @Test
        @DisplayName("should map completed AUDIO output without image")
        void shouldMapCompletedAudioOutputWithoutImage() {
            // Given
            UUID meditationId = UUID.randomUUID();
            UUID compositionId = UUID.randomUUID();
            UUID userId = UUID.randomUUID();
            Instant now = FIXED_NOW;

            MeditationOutput output = new MeditationOutput(
                    meditationId,
                    compositionId,
                    userId,
                    MediaType.AUDIO,
                    "Test audio content",
                    new MediaReference("forest-sounds"),
                    null,
                    "idempotency-key-456",
                    "https://s3.amazonaws.com/meditation-outputs/generation/user-456/audio.mp3",
                    "https://s3.amazonaws.com/meditation-outputs/generation/user-456/subs.srt",
                    240,
                    GenerationStatus.COMPLETED,
                    now,
                    now
            );

            // When
            GenerationResponse response = mapper.toGenerationResponse(output);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.meditationId()).isEqualTo(meditationId);
            assertThat(response.type()).isEqualTo("AUDIO");
            assertThat(response.mediaUrl()).contains("audio.mp3");
            assertThat(response.subtitleUrl()).contains("subs.srt");
            assertThat(response.durationSeconds()).isEqualTo(240);
            assertThat(response.status()).isEqualTo("COMPLETED");
        }

        @Test
        @DisplayName("should map PROCESSING output with null optional fields")
        void shouldMapProcessingOutputWithNullOptionalFields() {
            // Given
            UUID meditationId = UUID.randomUUID();
            UUID compositionId = UUID.randomUUID();
            UUID userId = UUID.randomUUID();
            Instant now = FIXED_NOW;

            MeditationOutput output = new MeditationOutput(
                    meditationId,
                    compositionId,
                    userId,
                    MediaType.VIDEO,
                    "Processing content",
                    new MediaReference("music-ref"),
                    new MediaReference("image-ref"),
                    "idempotency-key-processing",
                    null,  // No mediaUrl yet
                    null,  // No subtitleUrl yet
                    null,  // No duration yet
                    GenerationStatus.PROCESSING,
                    now,
                    now
            );

            // When
            GenerationResponse response = mapper.toGenerationResponse(output);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.meditationId()).isEqualTo(meditationId);
            assertThat(response.type()).isEqualTo("VIDEO");
            assertThat(response.mediaUrl()).isNull();
            assertThat(response.subtitleUrl()).isNull();
            assertThat(response.durationSeconds()).isNull();
            assertThat(response.status()).isEqualTo("PROCESSING");
            assertThat(response.message()).isEqualTo("Generation in progress");
        }

        @Test
        @DisplayName("should map FAILED output")
        void shouldMapFailedOutput() {
            // Given
            UUID meditationId = UUID.randomUUID();
            UUID compositionId = UUID.randomUUID();
            UUID userId = UUID.randomUUID();
            Instant now = FIXED_NOW;

            MeditationOutput output = new MeditationOutput(
                    meditationId,
                    compositionId,
                    userId,
                    MediaType.AUDIO,
                    "Failed content",
                    new MediaReference("music-ref"),
                    null,
                    "idempotency-key-failed",
                    null,
                    null,
                    null,
                    GenerationStatus.FAILED,
                    now,
                    now
            );

            // When
            GenerationResponse response = mapper.toGenerationResponse(output);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.status()).isEqualTo("FAILED");
            assertThat(response.message()).isEqualTo("Generation failed");
        }

        @Test
        @DisplayName("should map TIMEOUT output")
        void shouldMapTimeoutOutput() {
            // Given
            UUID meditationId = UUID.randomUUID();
            UUID compositionId = UUID.randomUUID();
            UUID userId = UUID.randomUUID();
            Instant now = FIXED_NOW;

            MeditationOutput output = new MeditationOutput(
                    meditationId,
                    compositionId,
                    userId,
                    MediaType.VIDEO,
                    "Timeout content",
                    new MediaReference("music-ref"),
                    new MediaReference("image-ref"),
                    "idempotency-key-timeout",
                    null,
                    null,
                    null,
                    GenerationStatus.TIMEOUT,
                    now,
                    now
            );

            // When
            GenerationResponse response = mapper.toGenerationResponse(output);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.status()).isEqualTo("TIMEOUT");
            assertThat(response.message()).isEqualTo("Processing time exceeded");
        }

        @Test
        @DisplayName("should throw NullPointerException when output is null")
        void shouldThrowNullPointerExceptionWhenOutputIsNull() {
            // When/Then
            assertThatThrownBy(() -> mapper.toGenerationResponse(null))
                    .isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("MeditationOutput must not be null");
        }
    }
}
