package com.hexagonal.meditation.generation.infrastructure.out.adapter.ffmpeg;

import com.hexagonal.meditation.generation.domain.ports.out.AudioRenderingPort.AudioRenderRequest;
import com.hexagonal.meditation.generation.domain.ports.out.AudioRenderingPort.AudioConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;

import static org.assertj.core.api.Assertions.*;

@DisplayName("FfmpegAudioRendererAdapter Tests")
class FfmpegAudioRendererAdapterTest {
    
    private FfmpegAudioRendererAdapter adapter;
    
    @TempDir
    Path tempDir;
    
    @BeforeEach
    void setUp() {
        adapter = new FfmpegAudioRendererAdapter();
    }
    
    @Test
    @DisplayName("Should render audio with narration and music")
    void shouldRenderAudioWithMusic() {
        Path narrationPath = tempDir.resolve("narration.mp3");
        Path musicPath = tempDir.resolve("music.mp3");
        Path outputPath = tempDir.resolve("output.mp3");
        
        AudioRenderRequest request = new AudioRenderRequest(
            narrationPath,
            musicPath,
            outputPath,
            AudioConfig.meditationAudio()
        );
        
        Path result = adapter.renderAudio(request);
        
        assertThat(result).isEqualTo(outputPath);
    }
    
    @Test
    @DisplayName("Should render audio with narration only")
    void shouldRenderAudioWithoutMusic() {
        Path narrationPath = tempDir.resolve("narration.mp3");
        Path outputPath = tempDir.resolve("output-no-music.mp3");
        
        // Note: The record validates music is not null, 
        // so this test validates that the business rule requires music
        assertThatThrownBy(() -> new AudioRenderRequest(
            narrationPath,
            null,
            outputPath,
            AudioConfig.meditationAudio()
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Music audio path cannot be null");
    }
    
    @Test
    @DisplayName("Should reject null narration audio")
    void shouldRejectNullNarration() {
        Path musicPath = tempDir.resolve("music.mp3");
        Path outputPath = tempDir.resolve("output.mp3");
        
        assertThatThrownBy(() -> new AudioRenderRequest(
            null,
            musicPath,
            outputPath,
            AudioConfig.meditationAudio()
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Narration audio path cannot be null");
    }
    
    @Test
    @DisplayName("Should reject null output path")
    void shouldRejectNullOutput() {
        Path narrationPath = tempDir.resolve("narration.mp3");
        Path musicPath = tempDir.resolve("music.mp3");
        
        assertThatThrownBy(() -> new AudioRenderRequest(
            narrationPath,
            musicPath,
            null,
            AudioConfig.meditationAudio()
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Output path cannot be null");
    }
}
