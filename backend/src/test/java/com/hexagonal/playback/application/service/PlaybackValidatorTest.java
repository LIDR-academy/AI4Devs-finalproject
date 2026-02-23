package com.hexagonal.playback.application.service;

import com.hexagonal.playback.domain.exception.MeditationNotPlayableException;
import com.hexagonal.playback.domain.model.Meditation;
import com.hexagonal.playback.domain.model.MediaUrls;
import com.hexagonal.playback.domain.model.ProcessingState;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("PlaybackValidator Tests")
class PlaybackValidatorTest {

    private static final Instant FIXED_NOW = Instant.parse("2026-01-01T00:00:00Z");

    private PlaybackValidator playbackValidator;

    @BeforeEach
    void setUp() {
        playbackValidator = new PlaybackValidator();
    }

    @Test
    @DisplayName("Should not throw exception when meditation is COMPLETED")
    void shouldNotThrowExceptionWhenMeditationIsCompleted() {
        // Given
        Meditation completedMeditation = new Meditation(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Completed Meditation",
            FIXED_NOW,
            ProcessingState.COMPLETED,
            new MediaUrls("http://audio.url", null, null)
        );

        // When / Then
        assertThatCode(() -> playbackValidator.validatePlayable(completedMeditation))
            .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Should throw MeditationNotPlayableException when meditation is PENDING")
    void shouldThrowExceptionWhenMeditationIsPending() {
        // Given
        UUID meditationId = UUID.randomUUID();
        Meditation pendingMeditation = new Meditation(
            meditationId,
            UUID.randomUUID(),
            "Pending Meditation",
            FIXED_NOW,
            ProcessingState.PENDING,
            null
        );

        // When / Then
        assertThatThrownBy(() -> playbackValidator.validatePlayable(pendingMeditation))
            .isInstanceOf(MeditationNotPlayableException.class)
            .hasMessageContaining(meditationId.toString())
            .satisfies(ex -> {
                MeditationNotPlayableException exception = (MeditationNotPlayableException) ex;
                org.assertj.core.api.Assertions.assertThat(exception.getUserMessage())
                    .isEqualTo("La meditación está en cola para ser generada.");
            });
    }

    @Test
    @DisplayName("Should throw MeditationNotPlayableException when meditation is PROCESSING")
    void shouldThrowExceptionWhenMeditationIsProcessing() {
        // Given
        UUID meditationId = UUID.randomUUID();
        Meditation processingMeditation = new Meditation(
            meditationId,
            UUID.randomUUID(),
            "Processing Meditation",
            FIXED_NOW,
            ProcessingState.PROCESSING,
            null
        );

        // When / Then
        assertThatThrownBy(() -> playbackValidator.validatePlayable(processingMeditation))
            .isInstanceOf(MeditationNotPlayableException.class)
            .hasMessageContaining(meditationId.toString())
            .satisfies(ex -> {
                MeditationNotPlayableException exception = (MeditationNotPlayableException) ex;
                org.assertj.core.api.Assertions.assertThat(exception.getUserMessage())
                    .isEqualTo("Esta meditación aún se está procesando. Por favor, espera a que esté lista.");
            });
    }

    @Test
    @DisplayName("Should throw MeditationNotPlayableException when meditation is FAILED")
    void shouldThrowExceptionWhenMeditationIsFailed() {
        // Given
        UUID meditationId = UUID.randomUUID();
        Meditation failedMeditation = new Meditation(
            meditationId,
            UUID.randomUUID(),
            "Failed Meditation",
            FIXED_NOW,
            ProcessingState.FAILED,
            null
        );

        // When / Then
        assertThatThrownBy(() -> playbackValidator.validatePlayable(failedMeditation))
            .isInstanceOf(MeditationNotPlayableException.class)
            .hasMessageContaining(meditationId.toString())
            .satisfies(ex -> {
                MeditationNotPlayableException exception = (MeditationNotPlayableException) ex;
                org.assertj.core.api.Assertions.assertThat(exception.getUserMessage())
                    .isEqualTo("Error al generar la meditación. Por favor, inténtalo de nuevo.");
            });
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when meditation is null")
    void shouldThrowExceptionWhenMeditationIsNull() {
        // When / Then
        assertThatThrownBy(() -> playbackValidator.validatePlayable(null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("meditation cannot be null");
    }

    @Test
    @DisplayName("Should use domain isPlayable() method for validation")
    void shouldUseDomainIsPlayableMethodForValidation() {
        // Given
        Meditation completedMeditation = new Meditation(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Test",
            FIXED_NOW,
            ProcessingState.COMPLETED,
            new MediaUrls("http://audio.url", null, null)
        );

        Meditation pendingMeditation = new Meditation(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Test",
            FIXED_NOW,
            ProcessingState.PENDING,
            null
        );

        // When / Then
        assertThatCode(() -> playbackValidator.validatePlayable(completedMeditation))
            .doesNotThrowAnyException();

        assertThatThrownBy(() -> playbackValidator.validatePlayable(pendingMeditation))
            .isInstanceOf(MeditationNotPlayableException.class);
    }
}
