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
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("MeditationOutputDtoMapper Tests")
class MeditationOutputDtoMapperTest {

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
            String userId = "user-123";
            Instant now = Instant.now();

            MeditationOutput output = new MeditationOutput(
                    meditationId,
                    compositionId,
                    userId,
                    MediaType.VIDEO,
                    "Test meditation text",
                    new MediaReference("calm-music"),
                    Optional.of(new MediaReference("peaceful-image")),
                    "idempotency-key-123",
                    Optional.of("https://s3.amazonaws.com/meditation-outputs/generation/user-123/video.mp4"),
                    Optional.of("https://s3.amazonaws.com/meditation-outputs/generation/user-123/subs.srt"),
                    Optional.of(180),
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
            String userId = "user-456";
            Instant now = Instant.now();

            MeditationOutput output = new MeditationOutput(
                    meditationId,
                    compositionId,
                    userId,
                    MediaType.AUDIO,
                    "Test audio content",
                    new MediaReference("forest-sounds"),
                    Optional.empty(),
                    "idempotency-key-456",
                    Optional.of("https://s3.amazonaws.com/meditation-outputs/generation/user-456/audio.mp3"),
                    Optional.of("https://s3.amazonaws.com/meditation-outputs/generation/user-456/subs.srt"),
                    Optional.of(240),
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
            String userId = "user-processing";
            Instant now = Instant.now();

            MeditationOutput output = new MeditationOutput(
                    meditationId,
                    compositionId,
                    userId,
                    MediaType.VIDEO,
                    "Processing content",
                    new MediaReference("music-ref"),
                    Optional.of(new MediaReference("image-ref")),
                    "idempotency-key-processing",
                    Optional.empty(),  // No mediaUrl yet
                    Optional.empty(),  // No subtitleUrl yet
                    Optional.empty(),  // No duration yet
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
            String userId = "user-failed";
            Instant now = Instant.now();

            MeditationOutput output = new MeditationOutput(
                    meditationId,
                    compositionId,
                    userId,
                    MediaType.AUDIO,
                    "Failed content",
                    new MediaReference("music-ref"),
                    Optional.empty(),
                    "idempotency-key-failed",
                    Optional.empty(),
                    Optional.empty(),
                    Optional.empty(),
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
            String userId = "user-timeout";
            Instant now = Instant.now();

            MeditationOutput output = new MeditationOutput(
                    meditationId,
                    compositionId,
                    userId,
                    MediaType.VIDEO,
                    "Timeout content",
                    new MediaReference("music-ref"),
                    Optional.of(new MediaReference("image-ref")),
                    "idempotency-key-timeout",
                    Optional.empty(),
                    Optional.empty(),
                    Optional.empty(),
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
