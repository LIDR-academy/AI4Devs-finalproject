package com.hexagonal.playback.domain.exception;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests for MeditationNotFoundException.
 */
class MeditationNotFoundExceptionTest {

    @Test
    void shouldCreateExceptionWithMeditationId() {
        // Given
        UUID meditationId = UUID.randomUUID();
        
        // When
        MeditationNotFoundException exception = new MeditationNotFoundException(meditationId);
        
        // Then
        assertThat(exception.getMessage())
            .isEqualTo("Meditation not found with id: " + meditationId);
        assertThat(exception.getMeditationId()).isEqualTo(meditationId);
    }

    @Test
    void shouldCreateExceptionWithMeditationIdAndUserId() {
        // Given
        UUID meditationId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        
        // When
        MeditationNotFoundException exception = new MeditationNotFoundException(meditationId, userId);
        
        // Then
        assertThat(exception.getMessage())
            .isEqualTo("Meditation not found with id: " + meditationId + " for user: " + userId);
        assertThat(exception.getMeditationId()).isEqualTo(meditationId);
        assertThat(exception.getUserId()).isEqualTo(userId);
    }

    @Test
    void shouldBeRuntimeException() {
        // Given
        UUID meditationId = UUID.randomUUID();
        
        // When
        MeditationNotFoundException exception = new MeditationNotFoundException(meditationId);
        
        // Then
        assertThat(exception).isInstanceOf(RuntimeException.class);
    }
}
