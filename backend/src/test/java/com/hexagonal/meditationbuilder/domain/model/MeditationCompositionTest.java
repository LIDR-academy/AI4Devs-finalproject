package com.hexagonal.meditationbuilder.domain.model;

import com.hexagonal.meditationbuilder.domain.enums.OutputType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for MeditationComposition aggregate root.
 * TDD: Tests written FIRST before implementation.
 * 
 * Business Rules (from BDD scenarios):
 * - Composition has unique ID
 * - Text is mandatory
 * - Music is optional
 * - Image is optional
 * - Output type derived from image presence:
 *   - No image → PODCAST
 *   - Has image → VIDEO
 */
@DisplayName("MeditationComposition Aggregate Root Tests")
class MeditationCompositionTest {

    @Test
    @DisplayName("Should create composition with mandatory text only")
    void shouldCreateCompositionWithTextOnly() {
        // Given
        String compositionId = "comp-001";
        TextContent textContent = new TextContent("Breathe deeply...");
        
        // When
        MeditationComposition composition = new MeditationComposition(compositionId, textContent);
        
        // Then
        assertNotNull(composition);
        assertEquals(compositionId, composition.getId());
        assertEquals(textContent, composition.getTextContent());
        assertNull(composition.getMusicReference());
        assertNull(composition.getImageReference());
    }

    @Test
    @DisplayName("Should create composition with text and music")
    void shouldCreateCompositionWithTextAndMusic() {
        // Given
        String compositionId = "comp-002";
        TextContent textContent = new TextContent("Relax your mind...");
        MusicReference musicReference = new MusicReference("calm-ocean-waves");
        
        // When
        MeditationComposition composition = new MeditationComposition(
            compositionId, textContent, musicReference, null);
        
        // Then
        assertEquals(textContent, composition.getTextContent());
        assertEquals(musicReference, composition.getMusicReference());
        assertNull(composition.getImageReference());
    }

    @Test
    @DisplayName("Should create composition with text and image")
    void shouldCreateCompositionWithTextAndImage() {
        // Given
        String compositionId = "comp-003";
        TextContent textContent = new TextContent("Visualize peace...");
        ImageReference imageReference = new ImageReference("sunset-beach-001");
        
        // When
        MeditationComposition composition = new MeditationComposition(
            compositionId, textContent, null, imageReference);
        
        // Then
        assertEquals(textContent, composition.getTextContent());
        assertNull(composition.getMusicReference());
        assertEquals(imageReference, composition.getImageReference());
    }

    @Test
    @DisplayName("Should create composition with all elements")
    void shouldCreateCompositionWithAllElements() {
        // Given
        String compositionId = "comp-004";
        TextContent textContent = new TextContent("Complete meditation...");
        MusicReference musicReference = new MusicReference("calm-music");
        ImageReference imageReference = new ImageReference("mountain-view");
        
        // When
        MeditationComposition composition = new MeditationComposition(
            compositionId, textContent, musicReference, imageReference);
        
        // Then
        assertEquals(textContent, composition.getTextContent());
        assertEquals(musicReference, composition.getMusicReference());
        assertEquals(imageReference, composition.getImageReference());
    }

    @Test
    @DisplayName("Should reject null composition ID")
    void shouldRejectNullCompositionId() {
        // Given
        TextContent textContent = new TextContent("Test");
        
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            new MeditationComposition(null, textContent);
        }, "Composition ID cannot be null");
    }

    @Test
    @DisplayName("Should reject empty composition ID")
    void shouldRejectEmptyCompositionId() {
        // Given
        TextContent textContent = new TextContent("Test");
        
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            new MeditationComposition("", textContent);
        }, "Composition ID cannot be empty");
    }

    @Test
    @DisplayName("Should reject null text content")
    void shouldRejectNullTextContent() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            new MeditationComposition("comp-001", null);
        }, "Text content is mandatory");
    }

    @Test
    @DisplayName("Should return PODCAST output type when no image")
    void shouldReturnPodcastOutputTypeWhenNoImage() {
        // Given
        MeditationComposition composition = new MeditationComposition(
            "comp-001", 
            new TextContent("Breathe..."),
            new MusicReference("music-001"),
            null  // No image
        );
        
        // When
        OutputType outputType = composition.getOutputType();
        
        // Then
        assertEquals(OutputType.PODCAST, outputType);
    }

    @Test
    @DisplayName("Should return VIDEO output type when image is present")
    void shouldReturnVideoOutputTypeWhenImagePresent() {
        // Given
        MeditationComposition composition = new MeditationComposition(
            "comp-002",
            new TextContent("Visualize..."),
            new MusicReference("music-002"),
            new ImageReference("image-001")  // Image present
        );
        
        // When
        OutputType outputType = composition.getOutputType();
        
        // Then
        assertEquals(OutputType.VIDEO, outputType);
    }

    @Test
    @DisplayName("Should update text content")
    void shouldUpdateTextContent() {
        // Given
        MeditationComposition composition = new MeditationComposition(
            "comp-001", new TextContent("Original text"));
        TextContent newText = new TextContent("Updated text");
        
        // When
        composition.updateText(newText);
        
        // Then
        assertEquals(newText, composition.getTextContent());
    }

    @Test
    @DisplayName("Should update music reference")
    void shouldUpdateMusicReference() {
        // Given
        MeditationComposition composition = new MeditationComposition(
            "comp-001", new TextContent("Text"));
        MusicReference newMusic = new MusicReference("new-music");
        
        // When
        composition.selectMusic(newMusic);
        
        // Then
        assertEquals(newMusic, composition.getMusicReference());
    }

    @Test
    @DisplayName("Should set image reference")
    void shouldSetImageReference() {
        // Given
        MeditationComposition composition = new MeditationComposition(
            "comp-001", new TextContent("Text"));
        ImageReference newImage = new ImageReference("new-image");
        
        // When
        composition.setImage(newImage);
        
        // Then
        assertEquals(newImage, composition.getImageReference());
    }

    @Test
    @DisplayName("Should remove image reference")
    void shouldRemoveImageReference() {
        // Given
        MeditationComposition composition = new MeditationComposition(
            "comp-001", 
            new TextContent("Text"),
            null,
            new ImageReference("image-001")
        );
        
        // When
        composition.removeImage();
        
        // Then
        assertNull(composition.getImageReference());
    }

    @Test
    @DisplayName("Should change output type when image is set")
    void shouldChangeOutputTypeWhenImageIsSet() {
        // Given
        MeditationComposition composition = new MeditationComposition(
            "comp-001", new TextContent("Text"));
        assertEquals(OutputType.PODCAST, composition.getOutputType());
        
        // When
        composition.setImage(new ImageReference("image-001"));
        
        // Then
        assertEquals(OutputType.VIDEO, composition.getOutputType());
    }

    @Test
    @DisplayName("Should change output type when image is removed")
    void shouldChangeOutputTypeWhenImageIsRemoved() {
        // Given
        MeditationComposition composition = new MeditationComposition(
            "comp-001", 
            new TextContent("Text"),
            null,
            new ImageReference("image-001")
        );
        assertEquals(OutputType.VIDEO, composition.getOutputType());
        
        // When
        composition.removeImage();
        
        // Then
        assertEquals(OutputType.PODCAST, composition.getOutputType());
    }
}
