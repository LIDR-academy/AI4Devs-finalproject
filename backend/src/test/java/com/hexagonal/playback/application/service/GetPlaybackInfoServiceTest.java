package com.hexagonal.playback.application.service;

import com.hexagonal.playback.domain.exception.MeditationNotFoundException;
import com.hexagonal.playback.domain.exception.MeditationNotPlayableException;
import com.hexagonal.playback.domain.model.Meditation;
import com.hexagonal.playback.domain.model.MediaUrls;
import com.hexagonal.playback.domain.model.ProcessingState;
import com.hexagonal.playback.domain.ports.out.MeditationRepositoryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("GetPlaybackInfoService Tests")
class GetPlaybackInfoServiceTest {

    @Mock
    private MeditationRepositoryPort meditationRepositoryPort;

    @Mock
    private PlaybackValidator playbackValidator;

    private GetPlaybackInfoService getPlaybackInfoService;

    @BeforeEach
    void setUp() {
        getPlaybackInfoService = new GetPlaybackInfoService(meditationRepositoryPort, playbackValidator);
    }

    @Test
    @DisplayName("Should return meditation when meditation exists, belongs to user, and is playable")
    void shouldReturnMeditationWhenValid() {
        // Given
        UUID meditationId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Meditation meditation = new Meditation(
            meditationId,
            userId,
            "Morning Meditation",
            Instant.now().minusSeconds(3600),
            ProcessingState.COMPLETED,
            new MediaUrls("http://audio.url", "http://video.url", null)
        );

        when(meditationRepositoryPort.findByIdAndUserId(meditationId, userId))
            .thenReturn(Optional.of(meditation));

        // When
        Meditation result = getPlaybackInfoService.execute(meditationId, userId);

        // Then
        assertThat(result).isEqualTo(meditation);
        verify(meditationRepositoryPort).findByIdAndUserId(meditationId, userId);
        verify(playbackValidator).validatePlayable(meditation);
    }

    @Test
    @DisplayName("Should throw MeditationNotFoundException when meditation does not exist")
    void shouldThrowMeditationNotFoundExceptionWhenMeditationDoesNotExist() {
        // Given
        UUID meditationId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(meditationRepositoryPort.findByIdAndUserId(meditationId, userId))
            .thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> getPlaybackInfoService.execute(meditationId, userId))
            .isInstanceOf(MeditationNotFoundException.class)
            .hasMessageContaining(meditationId.toString())
            .hasMessageContaining(userId.toString());
    }

    @Test
    @DisplayName("Should throw MeditationNotFoundException when meditation belongs to different user")
    void shouldThrowMeditationNotFoundExceptionWhenMeditationBelongsToDifferentUser() {
        // Given
        UUID meditationId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID differentUserId = UUID.randomUUID();

        when(meditationRepositoryPort.findByIdAndUserId(meditationId, userId))
            .thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> getPlaybackInfoService.execute(meditationId, userId))
            .isInstanceOf(MeditationNotFoundException.class);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when meditationId is null")
    void shouldThrowExceptionWhenMeditationIdIsNull() {
        // Given
        UUID userId = UUID.randomUUID();

        // When / Then
        assertThatThrownBy(() -> getPlaybackInfoService.execute(null, userId))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("meditationId cannot be null");
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when userId is null")
    void shouldThrowExceptionWhenUserIdIsNull() {
        // Given
        UUID meditationId = UUID.randomUUID();

        // When / Then
        assertThatThrownBy(() -> getPlaybackInfoService.execute(meditationId, null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("userId cannot be null");
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when both meditationId and userId are null")
    void shouldThrowExceptionWhenBothIdsAreNull() {
        // When / Then
        assertThatThrownBy(() -> getPlaybackInfoService.execute(null, null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("cannot be null");
    }

    @Test
    @DisplayName("Should delegate playability validation to PlaybackValidator")
    void shouldDelegatePlayabilityValidationToValidator() {
        // Given
        UUID meditationId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Meditation meditation = new Meditation(
            meditationId,
            userId,
            "Test Meditation",
            Instant.now(),
            ProcessingState.COMPLETED,
            new MediaUrls("http://audio.url", null, null)
        );

        when(meditationRepositoryPort.findByIdAndUserId(meditationId, userId))
            .thenReturn(Optional.of(meditation));

        // When
        getPlaybackInfoService.execute(meditationId, userId);

        // Then
        verify(playbackValidator).validatePlayable(meditation);
    }
}
