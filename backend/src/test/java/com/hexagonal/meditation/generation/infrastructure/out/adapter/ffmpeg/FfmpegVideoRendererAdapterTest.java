package com.hexagonal.meditation.generation.infrastructure.out.adapter.ffmpeg;

import com.hexagonal.meditation.generation.domain.ports.out.VideoRenderingPort.VideoRenderRequest;
import com.hexagonal.meditation.generation.infrastructure.config.FfmpegConfig;
import com.hexagonal.meditation.generation.domain.ports.out.VideoRenderingPort.VideoConfig;
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
    void setUp() throws Exception {
        adapter = new FfmpegVideoRendererAdapter(new FfmpegConfig());
        
        // Create actual dummy files so FFmpeg doesn't fail on missing inputs
        createDummyAudio(tempDir.resolve("narration.mp3"));
        createDummyAudio(tempDir.resolve("music.mp3"));
        createDummyImage(tempDir.resolve("background.jpg"));
        java.nio.file.Files.writeString(tempDir.resolve("subtitles.srt"), "1\n00:00:00,000 --> 00:00:01,000\nHello");
    }
    
    private void createDummyAudio(Path path) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(
            "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", "0.5", path.toAbsolutePath().toString()
        );
        pb.start().waitFor();
    }
    
    private void createDummyImage(Path path) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(
            "ffmpeg", "-y", "-f", "lavfi", "-i", "color=c=black:s=640x480", "-frames:v", "1", path.toAbsolutePath().toString()
        );
        pb.start().waitFor();
    }
    
    @Test
    @DisplayName("Should render video with all inputs")
    void shouldRenderVideo() throws java.io.IOException {
        Path narrationPath = tempDir.resolve("narration.mp3");
        Path imagePath = tempDir.resolve("background.jpg");
        Path srtPath = tempDir.resolve("subtitles.srt");
        Path musicPath = tempDir.resolve("music.mp3");
        // No need to write strings here as @BeforeEach did the job with real valid files
        Path outputPath = tempDir.resolve("output.mp4");
        
        VideoRenderRequest request = new VideoRenderRequest(
            narrationPath,
            musicPath,
            imagePath,
            srtPath,
            outputPath,
            VideoConfig.hdMeditationVideo()
        );
        
        Path result = adapter.renderVideo(request);
        
        assertThat(result).isEqualTo(outputPath);
    }
    
    @Test
    @DisplayName("Should render video with null background music")
    void shouldRenderVideoWithoutMusic() {
        Path narrationPath = tempDir.resolve("narration.mp3");
        Path imagePath = tempDir.resolve("background.jpg");
        Path srtPath = tempDir.resolve("subtitles.srt");
        Path outputPath = tempDir.resolve("output-no-music.mp4");
        
        // The record validates that music is not null, so this test validates the business rule
        assertThatThrownBy(() -> new VideoRenderRequest(
            narrationPath,
            null,
            imagePath,
            srtPath,
            outputPath,
            VideoConfig.hdMeditationVideo()
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Music audio path cannot be null");
    }
    
    @Test
    @DisplayName("Should reject null narration audio")
    void shouldRejectNullNarration() {
        Path imagePath = tempDir.resolve("background.jpg");
        Path srtPath = tempDir.resolve("subtitles.srt");
        Path musicPath = tempDir.resolve("music.mp3");
        Path outputPath = tempDir.resolve("output.mp4");
        
        assertThatThrownBy(() -> new VideoRenderRequest(
            null,
            musicPath,
            imagePath,
            srtPath,
            outputPath,
            VideoConfig.hdMeditationVideo()
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Narration audio path cannot be null");
    }
    
    @Test
    @DisplayName("Should reject null background image")
    void shouldRejectNullImage() {
        Path narrationPath = tempDir.resolve("narration.mp3");
        Path srtPath = tempDir.resolve("subtitles.srt");
        Path musicPath = tempDir.resolve("music.mp3");
        Path outputPath = tempDir.resolve("output.mp4");
        
        assertThatThrownBy(() -> new VideoRenderRequest(
            narrationPath,
            musicPath,
            null,
            srtPath,
            outputPath,
            VideoConfig.hdMeditationVideo()
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Image path cannot be null");
    }
    
    @Test
    @DisplayName("Should reject null SRT subtitles")
    void shouldRejectNullSubtitles() {
        Path narrationPath = tempDir.resolve("narration.mp3");
        Path imagePath = tempDir.resolve("background.jpg");
        Path musicPath = tempDir.resolve("music.mp3");
        Path outputPath = tempDir.resolve("output.mp4");
        
        assertThatThrownBy(() -> new VideoRenderRequest(
            narrationPath,
            musicPath,
            imagePath,
            null,
            outputPath,
            VideoConfig.hdMeditationVideo()
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Subtitle path cannot be null");
    }
    
    @Test
    @DisplayName("Should reject null output path")
    void shouldRejectNullOutput() {
        Path narrationPath = tempDir.resolve("narration.mp3");
        Path imagePath = tempDir.resolve("background.jpg");
        Path srtPath = tempDir.resolve("subtitles.srt");
        Path musicPath = tempDir.resolve("music.mp3");
        
        assertThatThrownBy(() -> new VideoRenderRequest(
            narrationPath,
            musicPath,
            imagePath,
            srtPath,
            null,
            VideoConfig.hdMeditationVideo()
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Output path cannot be null");
    }
}
