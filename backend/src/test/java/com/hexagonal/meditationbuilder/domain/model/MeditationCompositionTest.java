package com.hexagonal.meditationbuilder.domain.model;

import com.hexagonal.meditationbuilder.domain.enums.OutputType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for MeditationComposition aggregate root (record).
 * TDD: Tests written FIRST before implementation.
 * 
 * Business Rules (from BDD scenarios):
 * - Composition has unique UUID
 * - Text is mandatory
 * - Music is optional
 * - Image is optional
 * - Output type derived from image presence:
 *   - No image → PODCAST
 *   - Has image → VIDEO
 * - createdAt/updatedAt timestamps tracked
 * - Immutable with functional API (withX methods return new instances)
 */
@DisplayName("MeditationComposition Aggregate Root Tests")
class MeditationCompositionTest {

    private static final Clock FIXED_CLOCK = Clock.fixed(
        Instant.parse("2026-01-28T10:00:00Z"), 
        ZoneId.of("UTC")
    );

    @Test
    @DisplayName("Should create composition with factory method and UUID generation")
    void shouldCreateCompositionWithFactoryMethod() {
        // Given
        TextContent textContent = new TextContent("Breathe deeply...");
        
        // When
        MeditationComposition composition = MeditationComposition.create(textContent, FIXED_CLOCK);
        
        // Then
        assertNotNull(composition);
        assertNotNull(composition.id());
        assertEquals(textContent, composition.textContent());
        assertNull(composition.musicReference());
        assertNull(composition.imageReference());
        assertEquals(Instant.parse("2026-01-28T10:00:00Z"), composition.createdAt());
        assertEquals(Instant.parse("2026-01-28T10:00:00Z"), composition.updatedAt());
    }

    @Test
    @DisplayName("Should create composition with provided UUID")
    void shouldCreateCompositionWithProvidedUuid() {
        // Given
        UUID providedId = UUID.randomUUID();
        TextContent textContent = new TextContent("Meditation text");
        
        // When
        MeditationComposition composition = MeditationComposition.create(providedId, textContent, FIXED_CLOCK);
        
        // Then
        assertEquals(providedId, composition.id());
        assertEquals(textContent, composition.textContent());
    }

    @Test
    @DisplayName("Should create composition using convenience factory without Clock")
    void shouldCreateCompositionWithoutExplicitClock() {
        // Given
        TextContent textContent = new TextContent("Test");
        
        // When
        MeditationComposition composition = MeditationComposition.create(textContent);
        
        // Then
        assertNotNull(composition.id());
        assertNotNull(composition.createdAt());
        assertNotNull(composition.updatedAt());
    }

    @Test
    @DisplayName("Should reject null ID in record constructor")
    void shouldRejectNullId() {
        // Given
        TextContent textContent = new TextContent("Test");
        Instant now = FIXED_CLOCK.instant();
        
        // When & Then
        assertThrows(NullPointerException.class, () -> {
            new MeditationComposition(null, textContent, null, null, now, now);
        });
    }

    @Test
    @DisplayName("Should reject null text content")
    void shouldRejectNullTextContent() {
        // Given
        UUID id = UUID.randomUUID();
        Instant now = FIXED_CLOCK.instant();
        
        // When & Then
        assertThrows(NullPointerException.class, () -> {
            new MeditationComposition(id, null, null, null, now, now);
        });
    }

    @Test
    @DisplayName("Should reject updatedAt before createdAt")
    void shouldRejectUpdatedAtBeforeCreatedAt() {
        // Given
        UUID id = UUID.randomUUID();
        TextContent text = new TextContent("Test");
        Instant createdAt = Instant.parse("2026-01-28T10:00:00Z");
        Instant updatedAt = Instant.parse("2026-01-28T09:00:00Z"); // Before createdAt
        
        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            new MeditationComposition(id, text, null, null, createdAt, updatedAt);
        });
        assertTrue(exception.getMessage().contains("updatedAt must be >= createdAt"));
    }

    @Test
    @DisplayName("Should return PODCAST output type when no image")
    void shouldReturnPodcastOutputTypeWhenNoImage() {
        // Given
        MeditationComposition composition = MeditationComposition.create(
            new TextContent("Breathe...")
        ).withMusic(new MusicReference("music-001"));
        
        // When
        OutputType outputType = composition.outputType();
        
        // Then
        assertEquals(OutputType.PODCAST, outputType);
        assertFalse(composition.hasImage());
    }

    @Test
    @DisplayName("Should return VIDEO output type when image is present")
    void shouldReturnVideoOutputTypeWhenImagePresent() {
        // Given
        MeditationComposition composition = MeditationComposition.create(
            new TextContent("Visualize...")
        ).withImage(new ImageReference("image-001"));
        
        // When
        OutputType outputType = composition.outputType();
        
        // Then
        assertEquals(OutputType.VIDEO, outputType);
        assertTrue(composition.hasImage());
    }

    @Test
    @DisplayName("Should update text immutably and update timestamp")
    void shouldUpdateTextImmutably() {
        // Given
        Clock clock1 = Clock.fixed(Instant.parse("2026-01-28T10:00:00Z"), ZoneId.of("UTC"));
        Clock clock2 = Clock.fixed(Instant.parse("2026-01-28T10:05:00Z"), ZoneId.of("UTC"));
        
        MeditationComposition original = MeditationComposition.create(
            new TextContent("Original text"), clock1);
        TextContent newText = new TextContent("Updated text");
        
        // When
        MeditationComposition updated = original.withText(newText, clock2);
        
        // Then
        assertNotSame(original, updated, "withText must return new instance");
        assertEquals("Original text", original.textContent().value(), "Original unchanged");
        assertEquals("Updated text", updated.textContent().value(), "Updated has new text");
        assertEquals(original.id(), updated.id(), "ID preserved");
        assertEquals(Instant.parse("2026-01-28T10:00:00Z"), original.updatedAt(), "Original updatedAt unchanged");
        assertEquals(Instant.parse("2026-01-28T10:05:00Z"), updated.updatedAt(), "Updated timestamp changed");
    }

    @Test
    @DisplayName("Should set music immutably")
    void shouldSetMusicImmutably() {
        // Given
        MeditationComposition original = MeditationComposition.create(new TextContent("Text"));
        MusicReference newMusic = new MusicReference("new-music");
        
        // When
        MeditationComposition updated = original.withMusic(newMusic);
        
        // Then
        assertNotSame(original, updated);
        assertNull(original.musicReference(), "Original has no music");
        assertEquals(newMusic, updated.musicReference(), "Updated has music");
        assertTrue(updated.hasMusic());
    }

    @Test
    @DisplayName("Should remove music immutably")
    void shouldRemoveMusicImmutably() {
        // Given
        MeditationComposition original = MeditationComposition.create(new TextContent("Text"))
            .withMusic(new MusicReference("music-001"));
        
        // When
        MeditationComposition updated = original.withoutMusic();
        
        // Then
        assertNotSame(original, updated);
        assertNotNull(original.musicReference(), "Original has music");
        assertNull(updated.musicReference(), "Updated has no music");
        assertFalse(updated.hasMusic());
    }

    @Test
    @DisplayName("Should set image immutably and change output type")
    void shouldSetImageImmutably() {
        // Given
        MeditationComposition original = MeditationComposition.create(new TextContent("Text"));
        ImageReference newImage = new ImageReference("new-image");
        
        // When
        MeditationComposition updated = original.withImage(newImage);
        
        // Then
        assertNotSame(original, updated);
        assertEquals(OutputType.PODCAST, original.outputType(), "Original is PODCAST");
        assertEquals(OutputType.VIDEO, updated.outputType(), "Updated is VIDEO");
        assertNull(original.imageReference());
        assertEquals(newImage, updated.imageReference());
    }

    @Test
    @DisplayName("Should remove image immutably and change output type")
    void shouldRemoveImageImmutably() {
        // Given
        MeditationComposition original = MeditationComposition.create(new TextContent("Text"))
            .withImage(new ImageReference("image-001"));
        
        // When
        MeditationComposition updated = original.withoutImage();
        
        // Then
        assertNotSame(original, updated);
        assertEquals(OutputType.VIDEO, original.outputType(), "Original is VIDEO");
        assertEquals(OutputType.PODCAST, updated.outputType(), "Updated is PODCAST");
        assertNotNull(original.imageReference());
        assertNull(updated.imageReference());
    }

    @Test
    @DisplayName("Should provide Optional accessors for nullable fields")
    void shouldProvideOptionalAccessors() {
        // Given
        MeditationComposition withMusic = MeditationComposition.create(new TextContent("Text"))
            .withMusic(new MusicReference("music-001"));
        MeditationComposition withImage = MeditationComposition.create(new TextContent("Text"))
            .withImage(new ImageReference("image-001"));
        MeditationComposition minimal = MeditationComposition.create(new TextContent("Text"));
        
        // Then
        assertTrue(withMusic.musicReferenceOpt().isPresent());
        assertTrue(withImage.imageReferenceOpt().isPresent());
        assertTrue(minimal.musicReferenceOpt().isEmpty());
        assertTrue(minimal.imageReferenceOpt().isEmpty());
    }

    @Test
    @DisplayName("Should chain immutable operations")
    void shouldChainImmutableOperations() {
        // Given
        TextContent text = new TextContent("Initial text");
        
        // When
        MeditationComposition composition = MeditationComposition.create(text)
            .withMusic(new MusicReference("calm-music"))
            .withImage(new ImageReference("sunset"))
            .withText(new TextContent("Updated text"));
        
        // Then
        assertEquals("Updated text", composition.textContent().value());
        assertEquals("calm-music", composition.musicReference().value());
        assertEquals("sunset", composition.imageReference().value());
        assertEquals(OutputType.VIDEO, composition.outputType());
    }

    @Test
    @DisplayName("Should reject null in withText")
    void shouldRejectNullInWithText() {
        // Given
        MeditationComposition composition = MeditationComposition.create(new TextContent("Text"));
        
        // When & Then
        assertThrows(NullPointerException.class, () -> {
            composition.withText(null);
        });
    }

    @Test
    @DisplayName("Should reject null in withImage")
    void shouldRejectNullInWithImage() {
        // Given
        MeditationComposition composition = MeditationComposition.create(new TextContent("Text"));
        
        // When & Then
        assertThrows(NullPointerException.class, () -> {
            composition.withImage(null);
        });
    }

    @Test
    @DisplayName("Should allow null in withMusic to remove music")
    void shouldAllowNullInWithMusicToRemove() {
        // Given
        MeditationComposition composition = MeditationComposition.create(new TextContent("Text"))
            .withMusic(new MusicReference("music-001"));
        
        // When
        MeditationComposition updated = composition.withMusic(null);
        
        // Then
        assertNull(updated.musicReference());
        assertFalse(updated.hasMusic());
    }
}
