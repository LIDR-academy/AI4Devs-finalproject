package com.hexagonal.meditation.generation.domain.port.out;

import java.nio.file.Path;

/**
 * Port for audio rendering using external tools like FFmpeg.
 * Renders audio by mixing narration with optional background music.
 */
public interface AudioRenderingPort {
    
    /**
     * Render audio from narration and optional background music.
     * Output should be 48kHz stereo audio with loudnorm filter applied.
     * 
     * @param narrationAudioPath path to narration audio file
     * @param backgroundMusicPath path to background music file (nullable)
     * @param outputPath path where rendered audio should be saved
     * @return actual path of rendered audio file
     */
    Path renderAudio(Path narrationAudioPath, Path backgroundMusicPath, Path outputPath);
    
    /**
     * Check if FFmpeg is installed and available.
     * 
     * @return true if FFmpeg is available, false otherwise
     */
    boolean validateFfmpegInstalled();
    
    /**
     * Get FFmpeg version string.
     * 
     * @return FFmpeg version or error message
     */
    String getFfmpegVersion();
}
