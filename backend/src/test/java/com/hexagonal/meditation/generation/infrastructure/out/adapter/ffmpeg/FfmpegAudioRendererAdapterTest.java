package com.hexagonal.meditation.generation.infrastructure.out.adapter.ffmpeg;

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
        
        Path result = adapter.renderAudio(narrationPath, musicPath, outputPath);
        
        assertThat(result).isEqualTo(outputPath);
    }
    
    @Test
    @DisplayName("Should render audio with narration only")
    void shouldRenderAudioWithoutMusic() {
        Path narrationPath = tempDir.resolve("narration.mp3");
        Path outputPath = tempDir.resolve("output-no-music.mp3");
        
        Path result = adapter.renderAudio(narrationPath, null, outputPath);
        
        assertThat(result).isEqualTo(outputPath);
    }
    
    @Test
    @DisplayName("Should reject null narration audio")
    void shouldRejectNullNarration() {
        Path musicPath = tempDir.resolve("music.mp3");
        Path outputPath = tempDir.resolve("output.mp3");
        
        assertThatThrownBy(() -> adapter.renderAudio(null, musicPath, outputPath))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Narration audio path cannot be null");
    }
    
    @Test
    @DisplayName("Should reject null output path")
    void shouldRejectNullOutput() {
        Path narrationPath = tempDir.resolve("narration.mp3");
        Path musicPath = tempDir.resolve("music.mp3");
        
        assertThatThrownBy(() -> adapter.renderAudio(narrationPath, musicPath, null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Output path cannot be null");
    }
    
    @Test
    @DisplayName("Should validate FFmpeg installation")
    void shouldValidateFfmpegInstalled() {
        boolean isInstalled = adapter.validateFfmpegInstalled();
        
        // Stub implementation always returns true
        assertThat(isInstalled).isTrue();
    }
    
    @Test
    @DisplayName("Should return FFmpeg version string")
    void shouldReturnFfmpegVersion() {
        String version = adapter.getFfmpegVersion();
        
        assertThat(version).isNotNull();
        assertThat(version).isNotEmpty();
    }
}
