package com.hexagonal.playback.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests for ProcessingState enum.
 * Validates state labels and business rules.
 */
class ProcessingStateTest {

    @Test
    void shouldHaveExactlyFourStates() {
        // Given/When
        ProcessingState[] states = ProcessingState.values();
        
        // Then
        assertThat(states).hasSize(4);
        assertThat(states).containsExactlyInAnyOrder(
            ProcessingState.PENDING,
            ProcessingState.PROCESSING,
            ProcessingState.COMPLETED,
            ProcessingState.FAILED
        );
    }

    @Test
    void shouldReturnCorrectSpanishLabelForPending() {
        // Given
        ProcessingState state = ProcessingState.PENDING;
        
        // When
        String label = state.getLabel();
        
        // Then
        assertThat(label).isEqualTo("En cola");
    }

    @Test
    void shouldReturnCorrectSpanishLabelForProcessing() {
        // Given
        ProcessingState state = ProcessingState.PROCESSING;
        
        // When
        String label = state.getLabel();
        
        // Then
        assertThat(label).isEqualTo("Generando");
    }

    @Test
    void shouldReturnCorrectSpanishLabelForCompleted() {
        // Given
        ProcessingState state = ProcessingState.COMPLETED;
        
        // When
        String label = state.getLabel();
        
        // Then
        assertThat(label).isEqualTo("Completada");
    }

    @Test
    void shouldReturnCorrectSpanishLabelForFailed() {
        // Given
        ProcessingState state = ProcessingState.FAILED;
        
        // When
        String label = state.getLabel();
        
        // Then
        assertThat(label).isEqualTo("Fallida");
    }

    @Test
    void shouldAllowPlaybackOnlyWhenCompleted() {
        // Given
        ProcessingState completed = ProcessingState.COMPLETED;
        
        // When
        boolean result = completed.isPlayable();
        
        // Then
        assertThat(result).isTrue();
    }

    @ParameterizedTest
    @EnumSource(value = ProcessingState.class, names = {"PENDING", "PROCESSING", "FAILED"})
    void shouldNotAllowPlaybackForNonCompletedStates(ProcessingState state) {
        // When
        boolean result = state.isPlayable();
        
        // Then
        assertThat(result).isFalse();
    }

    @Test
    void shouldReturnFromValueForValidState() {
        // When
        ProcessingState state = ProcessingState.fromValue("COMPLETED");
        
        // Then
        assertThat(state).isEqualTo(ProcessingState.COMPLETED);
    }

    @Test
    void shouldReturnNullForInvalidState() {
        // When
        ProcessingState state = ProcessingState.fromValue("INVALID");
        
        // Then
        assertThat(state).isNull();
    }

    @Test
    void shouldReturnNullForNullValue() {
        // When
        ProcessingState state = ProcessingState.fromValue(null);
        
        // Then
        assertThat(state).isNull();
    }
}
