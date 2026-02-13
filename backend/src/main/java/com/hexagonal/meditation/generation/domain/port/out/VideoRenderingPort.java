package com.hexagonal.meditation.generation.domain.port.out;

import java.nio.file.Path;

/**
 * Port for video rendering using external tools like FFmpeg.
 * Renders video from narration audio, background image, subtitles, and optional music.
 */
public interface VideoRenderingPort {
    
    /**
     * Render video from audio, image, subtitles, and optional background music.
     * Output should be 1280x720 resolution at 48kHz stereo audio.
     * 
     * @param narrationAudioPath path to narration audio file
     * @param backgroundImagePath path to background image file
     * @param srtSubtitlesPath path to SRT subtitle file
     * @param backgroundMusicPath path to background music file (nullable)
     * @param outputPath path where rendered video should be saved
     * @return actual path of rendered video file
     */
    Path renderVideo(Path narrationAudioPath, Path backgroundImagePath, 
                     Path srtSubtitlesPath, Path backgroundMusicPath, 
                     Path outputPath);
    
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
