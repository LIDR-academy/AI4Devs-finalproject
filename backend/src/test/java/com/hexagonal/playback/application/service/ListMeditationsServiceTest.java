package com.hexagonal.playback.application.service;

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
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ListMeditationsService Tests")
class ListMeditationsServiceTest {

    private static final Instant FIXED_NOW = Instant.parse("2026-01-01T00:00:00Z");

    @Mock
    private MeditationRepositoryPort meditationRepositoryPort;

    private ListMeditationsService listMeditationsService;

    @BeforeEach
    void setUp() {
        listMeditationsService = new ListMeditationsService(meditationRepositoryPort);
    }

    @Test
    @DisplayName("Should list meditations for valid userId")
    void shouldListMeditationsForValidUserId() {
        // Given
        UUID userId = UUID.randomUUID();
        List<Meditation> expectedMeditations = List.of(
            new Meditation(
                UUID.randomUUID(),
                userId,
                "Morning Meditation",
                FIXED_NOW.minusSeconds(3600),
                ProcessingState.COMPLETED,
                new MediaUrls("http://audio.url", null, null)
            ),
            new Meditation(
                UUID.randomUUID(),
                userId,
                "Evening Meditation",
                FIXED_NOW.minusSeconds(7200),
                ProcessingState.PROCESSING,
                null
            )
        );

        when(meditationRepositoryPort.findAllByUserId(userId)).thenReturn(expectedMeditations);

        // When
        List<Meditation> result = listMeditationsService.execute(userId);

        // Then
        assertThat(result).isEqualTo(expectedMeditations);
        verify(meditationRepositoryPort).findAllByUserId(userId);
    }

    @Test
    @DisplayName("Should return empty list when user has no meditations")
    void shouldReturnEmptyListWhenUserHasNoMeditations() {
        // Given
        UUID userId = UUID.randomUUID();
        when(meditationRepositoryPort.findAllByUserId(userId)).thenReturn(List.of());

        // When
        List<Meditation> result = listMeditationsService.execute(userId);

        // Then
        assertThat(result).isEmpty();
        verify(meditationRepositoryPort).findAllByUserId(userId);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when userId is null")
    void shouldThrowExceptionWhenUserIdIsNull() {
        // When / Then
        assertThatThrownBy(() -> listMeditationsService.execute(null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("userId cannot be null");
    }

    @Test
    @DisplayName("Should delegate ordering to repository (ordered by createdAt DESC)")
    void shouldDelegateOrderingToRepository() {
        // Given
        UUID userId = UUID.randomUUID();
        Instant now = FIXED_NOW;
        List<Meditation> orderedMeditations = List.of(
            new Meditation(UUID.randomUUID(), userId, "Latest", now, ProcessingState.COMPLETED, new MediaUrls("http://audio1.url", null, null)),
            new Meditation(UUID.randomUUID(), userId, "Older", now.minusSeconds(3600), ProcessingState.COMPLETED, new MediaUrls("http://audio2.url", null, null)),
            new Meditation(UUID.randomUUID(), userId, "Oldest", now.minusSeconds(7200), ProcessingState.COMPLETED, new MediaUrls("http://audio3.url", null, null))
        );

        when(meditationRepositoryPort.findAllByUserId(userId)).thenReturn(orderedMeditations);

        // When
        List<Meditation> result = listMeditationsService.execute(userId);

        // Then
        assertThat(result).hasSize(3);
        assertThat(result.get(0).title()).isEqualTo("Latest");
        assertThat(result.get(1).title()).isEqualTo("Older");
        assertThat(result.get(2).title()).isEqualTo("Oldest");
    }

    @Test
    @DisplayName("Should return meditations in all processing states")
    void shouldReturnMeditationsInAllProcessingStates() {
        // Given
        UUID userId = UUID.randomUUID();
        List<Meditation> mixedStateMeditations = List.of(
            new Meditation(UUID.randomUUID(), userId, "Completed", FIXED_NOW, ProcessingState.COMPLETED, new MediaUrls("http://audio.url", null, null)),
            new Meditation(UUID.randomUUID(), userId, "Processing", FIXED_NOW.minusSeconds(60), ProcessingState.PROCESSING, null),
            new Meditation(UUID.randomUUID(), userId, "Pending", FIXED_NOW.minusSeconds(120), ProcessingState.PENDING, null),
            new Meditation(UUID.randomUUID(), userId, "Failed", FIXED_NOW.minusSeconds(180), ProcessingState.FAILED, null)
        );

        when(meditationRepositoryPort.findAllByUserId(userId)).thenReturn(mixedStateMeditations);

        // When
        List<Meditation> result = listMeditationsService.execute(userId);

        // Then
        assertThat(result).hasSize(4);
        assertThat(result).extracting(Meditation::processingState)
            .containsExactly(ProcessingState.COMPLETED, ProcessingState.PROCESSING, ProcessingState.PENDING, ProcessingState.FAILED);
    }
}
