package com.hexagonal.meditation.generation.infrastructure.out.adapter.ffmpeg;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;

import static org.assertj.core.api.Assertions.*;

@DisplayName("FfmpegVideoRendererAdapter Tests")
class FfmpegVideoRendererAdapterTest {
    
    private FfmpegVideoRendererAdapter adapter;
    
    @TempDir
    Path tempDir;
    
    @BeforeEach
    void setUp() {
        adapter = new FfmpegVideoRendererAdapter();
    }
    
    @Test
    @DisplayName("Should render video with all inputs")
    void shouldRenderVideo() {
        Path narrationPath = tempDir.resolve("narration.mp3");
        Path imagePath = tempDir.resolve("background.jpg");
        Path srtPath = tempDir.resolve("subtitles.srt");
        Path musicPath = tempDir.resolve("music.mp3");
        Path outputPath = tempDir.resolve("output.mp4");
        
        Path result = adapter.renderVideo(narrationPath, imagePath, srtPath, musicPath, outputPath);
        
        assertThat(result).isEqualTo(outputPath);
    }
    
    @Test
    @DisplayName("Should render video with null background music")
    void shouldRenderVideoWithoutMusic() {
        Path narrationPath = tempDir.resolve("narration.mp3");
        Path imagePath = tempDir.resolve("background.jpg");
        Path srtPath = tempDir.resolve("subtitles.srt");
        Path outputPath = tempDir.resolve("output-no-music.mp4");
        
        Path result = adapter.renderVideo(narrationPath, imagePath, srtPath, null, outputPath);
        
        assertThat(result).isEqualTo(outputPath);
    }
    
    @Test
    @DisplayName("Should reject null narration audio")
    void shouldRejectNullNarration() {
        Path imagePath = tempDir.resolve("background.jpg");
        Path srtPath = tempDir.resolve("subtitles.srt");
        Path outputPath = tempDir.resolve("output.mp4");
        
        assertThatThrownBy(() -> adapter.renderVideo(null, imagePath, srtPath, null, outputPath))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Narration audio path cannot be null");
    }
    
    @Test
    @DisplayName("Should reject null background image")
    void shouldRejectNullImage() {
        Path narrationPath = tempDir.resolve("narration.mp3");
        Path srtPath = tempDir.resolve("subtitles.srt");
        Path outputPath = tempDir.resolve("output.mp4");
        
        assertThatThrownBy(() -> adapter.renderVideo(narrationPath, null, srtPath, null, outputPath))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Background image path cannot be null");
    }
    
    @Test
    @DisplayName("Should reject null SRT subtitles")
    void shouldRejectNullSubtitles() {
        Path narrationPath = tempDir.resolve("narration.mp3");
        Path imagePath = tempDir.resolve("background.jpg");
        Path outputPath = tempDir.resolve("output.mp4");
        
        assertThatThrownBy(() -> adapter.renderVideo(narrationPath, imagePath, null, null, outputPath))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("SRT subtitles path cannot be null");
    }
    
    @Test
    @DisplayName("Should reject null output path")
    void shouldRejectNullOutput() {
        Path narrationPath = tempDir.resolve("narration.mp3");
        Path imagePath = tempDir.resolve("background.jpg");
        Path srtPath = tempDir.resolve("subtitles.srt");
        
        assertThatThrownBy(() -> adapter.renderVideo(narrationPath, imagePath, srtPath, null, null))
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
