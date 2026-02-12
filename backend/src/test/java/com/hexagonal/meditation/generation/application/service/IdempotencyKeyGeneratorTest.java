package com.hexagonal.meditation.generation.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DisplayName("IdempotencyKeyGenerator Tests")
class IdempotencyKeyGeneratorTest {
    
    private IdempotencyKeyGenerator generator;
    
    @BeforeEach
    void setUp() {
        generator = new IdempotencyKeyGenerator();
    }
    
    @Test
    @DisplayName("Should generate consistent key for same inputs")
    void shouldGenerateConsistentKey() {
        UUID userId = UUID.randomUUID();
        String text = "Breathe deeply and relax";
        String music = "calm-ocean.mp3";
        String image = "sunset.jpg";
        
        String key1 = generator.generate(userId, text, music, image);
        String key2 = generator.generate(userId, text, music, image);
        
        assertThat(key1).isEqualTo(key2);
    }
    
    @Test
    @DisplayName("Should generate different keys for different user IDs")
    void shouldGenerateDifferentKeysForDifferentUsers() {
        UUID userId1 = UUID.randomUUID();
        UUID userId2 = UUID.randomUUID();
        String text = "Breathe deeply and relax";
        String music = "calm-ocean.mp3";
        String image = "sunset.jpg";
        
        String key1 = generator.generate(userId1, text, music, image);
        String key2 = generator.generate(userId2, text, music, image);
        
        assertThat(key1).isNotEqualTo(key2);
    }
    
    @Test
    @DisplayName("Should generate different keys for different text")
    void shouldGenerateDifferentKeysForDifferentText() {
        UUID userId = UUID.randomUUID();
        String text1 = "Breathe deeply and relax";
        String text2 = "Focus on your breath";
        String music = "calm-ocean.mp3";
        String image = "sunset.jpg";
        
        String key1 = generator.generate(userId, text1, music, image);
        String key2 = generator.generate(userId, text2, music, image);
        
        assertThat(key1).isNotEqualTo(key2);
    }
    
    @Test
    @DisplayName("Should generate different keys for different music")
    void shouldGenerateDifferentKeysForDifferentMusic() {
        UUID userId = UUID.randomUUID();
        String text = "Breathe deeply and relax";
        String music1 = "calm-ocean.mp3";
        String music2 = "forest-rain.mp3";
        String image = "sunset.jpg";
        
        String key1 = generator.generate(userId, text, music1, image);
        String key2 = generator.generate(userId, text, music2, image);
        
        assertThat(key1).isNotEqualTo(key2);
    }
    
    @Test
    @DisplayName("Should generate different keys for different images")
    void shouldGenerateDifferentKeysForDifferentImages() {
        UUID userId = UUID.randomUUID();
        String text = "Breathe deeply and relax";
        String music = "calm-ocean.mp3";
        String image1 = "sunset.jpg";
        String image2 = "mountain.jpg";
        
        String key1 = generator.generate(userId, text, music, image1);
        String key2 = generator.generate(userId, text, music, image2);
        
        assertThat(key1).isNotEqualTo(key2);
    }
    
    @Test
    @DisplayName("Should handle null music reference")
    void shouldHandleNullMusic() {
        UUID userId = UUID.randomUUID();
        String text = "Breathe deeply and relax";
        String image = "sunset.jpg";
        
        String key = generator.generate(userId, text, null, image);
        
        assertThat(key).isNotBlank();
        assertThat(key).hasSize(64); // SHA-256 produces 64 hex chars
    }
    
    @Test
    @DisplayName("Should handle null image reference (audio-only)")
    void shouldHandleNullImage() {
        UUID userId = UUID.randomUUID();
        String text = "Breathe deeply and relax";
        String music = "calm-ocean.mp3";
        
        String key = generator.generate(userId, text, music, null);
        
        assertThat(key).isNotBlank();
        assertThat(key).hasSize(64); // SHA-256 produces 64 hex chars
    }
    
    @Test
    @DisplayName("Should handle both null music and image")
    void shouldHandleBothNullReferences() {
        UUID userId = UUID.randomUUID();
        String text = "Breathe deeply and relax";
        
        String key = generator.generate(userId, text, null, null);
        
        assertThat(key).isNotBlank();
        assertThat(key).hasSize(64);
    }
    
    @Test
    @DisplayName("Should trim whitespace from text")
    void shouldTrimWhitespaceFromText() {
        UUID userId = UUID.randomUUID();
        String text1 = "Breathe deeply and relax";
        String text2 = "  Breathe deeply and relax  ";
        
        String key1 = generator.generate(userId, text1, null, null);
        String key2 = generator.generate(userId, text2, null, null);
        
        assertThat(key1).isEqualTo(key2);
    }
    
    @Test
    @DisplayName("Should trim whitespace from music reference")
    void shouldTrimWhitespaceFromMusic() {
        UUID userId = UUID.randomUUID();
        String text = "Breathe deeply and relax";
        String music1 = "calm-ocean.mp3";
        String music2 = "  calm-ocean.mp3  ";
        
        String key1 = generator.generate(userId, text, music1, null);
        String key2 = generator.generate(userId, text, music2, null);
        
        assertThat(key1).isEqualTo(key2);
    }
    
    @Test
    @DisplayName("Should trim whitespace from image reference")
    void shouldTrimWhitespaceFromImage() {
        UUID userId = UUID.randomUUID();
        String text = "Breathe deeply and relax";
        String image1 = "sunset.jpg";
        String image2 = "  sunset.jpg  ";
        
        String key1 = generator.generate(userId, text, null, image1);
        String key2 = generator.generate(userId, text, null, image2);
        
        assertThat(key1).isEqualTo(key2);
    }
    
    @Test
    @DisplayName("Should reject null userId")
    void shouldRejectNullUserId() {
        String text = "Breathe deeply and relax";
        
        assertThatThrownBy(() -> generator.generate(null, text, null, null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("userId cannot be null");
    }
    
    @Test
    @DisplayName("Should reject null text")
    void shouldRejectNullText() {
        UUID userId = UUID.randomUUID();
        
        assertThatThrownBy(() -> generator.generate(userId, null, null, null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("narrationText cannot be null or blank");
    }
    
    @Test
    @DisplayName("Should reject blank text")
    void shouldRejectBlankText() {
        UUID userId = UUID.randomUUID();
        
        assertThatThrownBy(() -> generator.generate(userId, "   ", null, null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("narrationText cannot be null or blank");
    }
    
    @Test
    @DisplayName("Should produce SHA-256 hex string (64 characters)")
    void shouldProduceSha256HexString() {
        UUID userId = UUID.randomUUID();
        String text = "Breathe deeply and relax";
        
        String key = generator.generate(userId, text, null, null);
        
        assertThat(key)
            .hasSize(64)
            .matches("[a-f0-9]{64}"); // lowercase hex
    }
    
    @Test
    @DisplayName("Should be deterministic across multiple invocations")
    void shouldBeDeterministicAcrossInvocations() {
        UUID userId = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        String text = "Breathe deeply and relax";
        String music = "calm-ocean.mp3";
        String image = "sunset.jpg";
        
        String key1 = generator.generate(userId, text, music, image);
        String key2 = generator.generate(userId, text, music, image);
        String key3 = generator.generate(userId, text, music, image);
        
        assertThat(key1).isEqualTo(key2).isEqualTo(key3);
    }
}
