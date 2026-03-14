package com.hexagonal.playback.domain.exception;

import com.hexagonal.playback.domain.model.ProcessingState;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests for MeditationNotPlayableException.
 */
class MeditationNotPlayableExceptionTest {

    @Test
    void shouldCreateExceptionWithMeditationIdAndProcessingState() {
        // Given
        UUID meditationId = UUID.randomUUID();
        ProcessingState state = ProcessingState.PROCESSING;
        
        // When
        MeditationNotPlayableException exception = new MeditationNotPlayableException(meditationId, state);
        
        // Then
        assertThat(exception.getMessage())
            .isEqualTo("Meditation " + meditationId + " is not playable. Current state: " + state.getLabel());
        assertThat(exception.getMeditationId()).isEqualTo(meditationId);
        assertThat(exception.getCurrentState()).isEqualTo(state);
    }

    @ParameterizedTest
    @EnumSource(value = ProcessingState.class, names = {"PENDING", "PROCESSING", "FAILED"})
    void shouldIncludeCorrectStateLabelInMessage(ProcessingState state) {
        // Given
        UUID meditationId = UUID.randomUUID();
        
        // When
        MeditationNotPlayableException exception = new MeditationNotPlayableException(meditationId, state);
        
        // Then
        assertThat(exception.getMessage()).contains(state.getLabel());
    }

    @Test
    void shouldProvideUserFriendlyMessage() {
        // Given
        UUID meditationId = UUID.randomUUID();
        ProcessingState state = ProcessingState.PROCESSING;
        
        // When
        MeditationNotPlayableException exception = new MeditationNotPlayableException(meditationId, state);
        
        // Then
        String userMessage = exception.getUserMessage();
        assertThat(userMessage)
            .isEqualTo("Esta meditación aún se está procesando. Por favor, espera a que esté lista.");
    }

    @Test
    void shouldBeRuntimeException() {
        // Given
        UUID meditationId = UUID.randomUUID();
        
        // When
        MeditationNotPlayableException exception = new MeditationNotPlayableException(
            meditationId, 
            ProcessingState.PENDING
        );
        
        // Then
        assertThat(exception).isInstanceOf(RuntimeException.class);
    }
}
