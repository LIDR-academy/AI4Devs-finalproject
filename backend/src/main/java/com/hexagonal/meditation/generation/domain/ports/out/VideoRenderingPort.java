package com.hexagonal.meditation.generation.domain.ports.out;

import java.nio.file.Path;

/**
 * Output port for video rendering.
 * Driven port for combining audio, image, and subtitles into video.
 * 
 * Hexagonal Architecture - Driven Port (Domain → Infrastructure)
 * BC: Generation
 * 
 * Implementation: FfmpegVideoRendererAdapter (FFmpeg CLI wrapper)
 */
public interface VideoRenderingPort {

    /**
     * Render video meditation from components.
     * Combines narration audio, background music, static image, and burned subtitles.
     * 
     * @param request video rendering configuration
     * @return path to generated video file (temporary)
     * @throws RuntimeException if rendering fails
     */
    Path renderVideo(VideoRenderRequest request);

    /**
     * Video rendering request (domain object).
     */
    record VideoRenderRequest(
        Path narrationAudioPath,
        Path musicAudioPath,
        Path imagePath,
        Path subtitlePath,
        Path outputPath,
        VideoConfig config
    ) {
        public VideoRenderRequest {
            if (narrationAudioPath == null) {
                throw new IllegalArgumentException("Narration audio path cannot be null");
            }
            if (musicAudioPath == null) {
                throw new IllegalArgumentException("Music audio path cannot be null");
            }
            if (imagePath == null) {
                throw new IllegalArgumentException("Image path cannot be null");
            }
            if (subtitlePath == null) {
                throw new IllegalArgumentException("Subtitle path cannot be null");
            }
            if (outputPath == null) {
                throw new IllegalArgumentException("Output path cannot be null");
            }
            if (config == null) {
                throw new IllegalArgumentException("Video config cannot be null");
            }
        }
    }

    /**
     * Video configuration (resolution, codec, audio mix).
     */
    record VideoConfig(
        int width,
        int height,
        int audioSampleRate,
        String audioChannels,
        double musicVolumeDb
    ) {
        public VideoConfig {
            if (width <= 0 || height <= 0) {
                throw new IllegalArgumentException("Width and height must be positive");
            }
            if (audioSampleRate <= 0) {
                throw new IllegalArgumentException("Audio sample rate must be positive");
            }
            if (audioChannels == null || audioChannels.isBlank()) {
                throw new IllegalArgumentException("Audio channels cannot be null or blank");
            }
        }

        /**
         * Default HD video configuration for meditation.
         */
        public static VideoConfig hdMeditationVideo() {
            return new VideoConfig(
                1280,
                720,
                48000,
                "stereo",
                -12.0 // music 12dB lower than narration
            );
        }
    }
}
