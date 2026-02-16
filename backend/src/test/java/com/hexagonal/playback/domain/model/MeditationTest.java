package com.hexagonal.playback.domain.model;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Tests for Meditation aggregate root.
 * Validates immutability, business rules, and domain invariants.
 */
class MeditationTest {

    private static final Clock FIXED_CLOCK = Clock.fixed(
        Instant.parse("2026-02-16T10:00:00Z"),
        ZoneId.of("UTC")
    );

    @Test
    void shouldCreateMeditationWithAllFields() {
        // Given
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String title = "Morning Mindfulness";
        Instant createdAt = Instant.now(FIXED_CLOCK);
        ProcessingState state = ProcessingState.COMPLETED;
        MediaUrls urls = new MediaUrls("https://example.com/audio.mp3", null, null);
        
        // When
        Meditation meditation = new Meditation(id, userId, title, createdAt, state, urls);
        
        // Then
        assertThat(meditation.id()).isEqualTo(id);
        assertThat(meditation.userId()).isEqualTo(userId);
        assertThat(meditation.title()).isEqualTo(title);
        assertThat(meditation.createdAt()).isEqualTo(createdAt);
        assertThat(meditation.processingState()).isEqualTo(state);
        assertThat(meditation.mediaUrls()).isEqualTo(urls);
    }

    @Test
    void shouldCreateMeditationWithNullMediaUrlsForNonCompletedState() {
        // Given
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Instant createdAt = Instant.now(FIXED_CLOCK);
        
        // When
        Meditation meditation = new Meditation(
            id, userId, "Pending Meditation", createdAt, ProcessingState.PENDING, null
        );
        
        // Then
        assertThat(meditation.mediaUrls()).isNull();
        assertThat(meditation.processingState()).isEqualTo(ProcessingState.PENDING);
    }

    @Test
    void shouldThrowExceptionWhenIdIsNull() {
        // When/Then
        assertThatThrownBy(() -> new Meditation(
            null,
            UUID.randomUUID(),
            "Title",
            Instant.now(FIXED_CLOCK),
            ProcessingState.COMPLETED,
            new MediaUrls("https://example.com/audio.mp3", null, null)
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Meditation id cannot be null");
    }

    @Test
    void shouldThrowExceptionWhenUserIdIsNull() {
        // When/Then
        assertThatThrownBy(() -> new Meditation(
            UUID.randomUUID(),
            null,
            "Title",
            Instant.now(FIXED_CLOCK),
            ProcessingState.COMPLETED,
            new MediaUrls("https://example.com/audio.mp3", null, null)
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("UserId cannot be null");
    }

    @Test
    void shouldThrowExceptionWhenTitleIsNull() {
        // When/Then
        assertThatThrownBy(() -> new Meditation(
            UUID.randomUUID(),
            UUID.randomUUID(),
            null,
            Instant.now(FIXED_CLOCK),
            ProcessingState.COMPLETED,
            new MediaUrls("https://example.com/audio.mp3", null, null)
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Title cannot be null or empty");
    }

    @Test
    void shouldThrowExceptionWhenTitleIsEmpty() {
        // When/Then
        assertThatThrownBy(() -> new Meditation(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "  ",
            Instant.now(FIXED_CLOCK),
            ProcessingState.COMPLETED,
            new MediaUrls("https://example.com/audio.mp3", null, null)
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Title cannot be null or empty");
    }

    @Test
    void shouldThrowExceptionWhenCreatedAtIsNull() {
        // When/Then
        assertThatThrownBy(() -> new Meditation(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Title",
            null,
            ProcessingState.COMPLETED,
            new MediaUrls("https://example.com/audio.mp3", null, null)
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("CreatedAt cannot be null");
    }

    @Test
    void shouldThrowExceptionWhenCreatedAtIsInFuture() {
        // Given
        Instant future = Instant.now(FIXED_CLOCK).plusSeconds(3600);
        
        // When/Then
        assertThatThrownBy(() -> new Meditation(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Title",
            future,
            ProcessingState.COMPLETED,
            new MediaUrls("https://example.com/audio.mp3", null, null),
            FIXED_CLOCK
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("CreatedAt cannot be in the future");
    }

    @Test
    void shouldThrowExceptionWhenProcessingStateIsNull() {
        // When/Then
        assertThatThrownBy(() -> new Meditation(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Title",
            Instant.now(FIXED_CLOCK),
            null,
            new MediaUrls("https://example.com/audio.mp3", null, null)
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("ProcessingState cannot be null");
    }

    @Test
    void shouldThrowExceptionWhenCompletedStateHasNoMediaUrls() {
        // When/Then
        assertThatThrownBy(() -> new Meditation(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Title",
            Instant.now(FIXED_CLOCK),
            ProcessingState.COMPLETED,
            null
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("MediaUrls are required for COMPLETED state");
    }

    @Test
    void shouldBePlayableWhenStateIsCompleted() {
        // Given
        Meditation meditation = new Meditation(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Title",
            Instant.now(FIXED_CLOCK),
            ProcessingState.COMPLETED,
            new MediaUrls("https://example.com/audio.mp3", null, null)
        );
        
        // When
        boolean result = meditation.isPlayable();
        
        // Then
        assertThat(result).isTrue();
    }

    @Test
    void shouldNotBePlayableWhenStateIsPending() {
        // Given
        Meditation meditation = new Meditation(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Title",
            Instant.now(FIXED_CLOCK),
            ProcessingState.PENDING,
            null
        );
        
        // When
        boolean result = meditation.isPlayable();
        
        // Then
        assertThat(result).isFalse();
    }

    @Test
    void shouldNotBePlayableWhenStateIsProcessing() {
        // Given
        Meditation meditation = new Meditation(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Title",
            Instant.now(FIXED_CLOCK),
            ProcessingState.PROCESSING,
            null
        );
        
        // When
        boolean result = meditation.isPlayable();
        
        // Then
        assertThat(result).isFalse();
    }

    @Test
    void shouldNotBePlayableWhenStateIsFailed() {
        // Given
        Meditation meditation = new Meditation(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Title",
            Instant.now(FIXED_CLOCK),
            ProcessingState.FAILED,
            null
        );
        
        // When
        boolean result = meditation.isPlayable();
        
        // Then
        assertThat(result).isFalse();
    }

    @Test
    void shouldBeImmutable() {
        // Given
        UUID id = UUID.randomUUID();
        Meditation meditation = new Meditation(
            id,
            UUID.randomUUID(),
            "Title",
            Instant.now(FIXED_CLOCK),
            ProcessingState.COMPLETED,
            new MediaUrls("https://example.com/audio.mp3", null, null)
        );
        
        // When/Then - Record fields are final by default
        assertThat(meditation.id()).isEqualTo(id);
        // No setters available - compilation would fail if attempted
    }

    @Test
    void shouldImplementEqualsBasedOnId() {
        // Given
        UUID id = UUID.randomUUID();
        Meditation m1 = new Meditation(
            id,
            UUID.randomUUID(),
            "Title 1",
            Instant.now(FIXED_CLOCK),
            ProcessingState.COMPLETED,
            new MediaUrls("https://example.com/audio1.mp3", null, null)
        );
        Meditation m2 = new Meditation(
            id,
            UUID.randomUUID(),
            "Title 2",
            Instant.now(FIXED_CLOCK).plusSeconds(60),
            ProcessingState.PENDING,
            null
        );
        
        // When/Then
        assertThat(m1).isEqualTo(m2); // Same id = same entity
        assertThat(m1.hashCode()).isEqualTo(m2.hashCode());
    }

    @Test
    void shouldNotBeEqualWhenIdsDiffer() {
        // Given
        Meditation m1 = new Meditation(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Title",
            Instant.now(FIXED_CLOCK),
            ProcessingState.COMPLETED,
            new MediaUrls("https://example.com/audio.mp3", null, null)
        );
        Meditation m2 = new Meditation(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Title",
            Instant.now(FIXED_CLOCK),
            ProcessingState.COMPLETED,
            new MediaUrls("https://example.com/audio.mp3", null, null)
        );
        
        // When/Then
        assertThat(m1).isNotEqualTo(m2);
    }

    @Test
    void shouldBelongToUser() {
        // Given
        UUID userId = UUID.randomUUID();
        Meditation meditation = new Meditation(
            UUID.randomUUID(),
            userId,
            "Title",
            Instant.now(FIXED_CLOCK),
            ProcessingState.COMPLETED,
            new MediaUrls("https://example.com/audio.mp3", null, null)
        );
        
        // When
        boolean result = meditation.belongsTo(userId);
        
        // Then
        assertThat(result).isTrue();
    }

    @Test
    void shouldNotBelongToOtherUser() {
        // Given
        Meditation meditation = new Meditation(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Title",
            Instant.now(FIXED_CLOCK),
            ProcessingState.COMPLETED,
            new MediaUrls("https://example.com/audio.mp3", null, null)
        );
        
        // When
        boolean result = meditation.belongsTo(UUID.randomUUID());
        
        // Then
        assertThat(result).isFalse();
    }

    @Test
    void shouldHaveToStringRepresentation() {
        // Given
        Meditation meditation = new Meditation(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Morning Mindfulness",
            Instant.now(FIXED_CLOCK),
            ProcessingState.COMPLETED,
            new MediaUrls("https://example.com/audio.mp3", null, null)
        );
        
        // When
        String toString = meditation.toString();
        
        // Then
        assertThat(toString).contains("id=");
        assertThat(toString).contains("title=");
        assertThat(toString).contains("processingState=");
    }
}
