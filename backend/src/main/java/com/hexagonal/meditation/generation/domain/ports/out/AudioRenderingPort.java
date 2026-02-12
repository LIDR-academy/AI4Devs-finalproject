package com.hexagonal.meditation.generation.domain.ports.out;

import java.nio.file.Path;

/**
 * Output port for audio rendering.
 * Driven port for combining narration and music into audio-only output.
 * 
 * Hexagonal Architecture - Driven Port (Domain → Infrastructure)
 * BC: Generation
 * 
 * Implementation: FfmpegAudioRendererAdapter (FFmpeg CLI wrapper)
 */
public interface AudioRenderingPort {

    /**
     * Render audio meditation from components.
     * Combines narration audio and background music with balanced mixing.
     * 
     * @param request audio rendering configuration
     * @return path to generated audio file (temporary)
     * @throws RuntimeException if rendering fails
     */
    Path renderAudio(AudioRenderRequest request);

    /**
     * Audio rendering request (domain object).
     */
    record AudioRenderRequest(
        Path narrationAudioPath,
        Path musicAudioPath,
        Path outputPath,
        AudioConfig config
    ) {
        public AudioRenderRequest {
            if (narrationAudioPath == null) {
                throw new IllegalArgumentException("Narration audio path cannot be null");
            }
            if (musicAudioPath == null) {
                throw new IllegalArgumentException("Music audio path cannot be null");
            }
            if (outputPath == null) {
                throw new IllegalArgumentException("Output path cannot be null");
            }
            if (config == null) {
                throw new IllegalArgumentException("Audio config cannot be null");
            }
        }
    }

    /**
     * Audio configuration (sample rate, channels, music volume).
     */
    record AudioConfig(
        int sampleRate,
        String channels,
        double musicVolumeDb
    ) {
        public AudioConfig {
            if (sampleRate <= 0) {
                throw new IllegalArgumentException("Sample rate must be positive");
            }
            if (channels == null || channels.isBlank()) {
                throw new IllegalArgumentException("Channels cannot be null or blank");
            }
        }

        /**
         * Default high-quality audio configuration for meditation.
         */
        public static AudioConfig meditationAudio() {
            return new AudioConfig(
                48000,
                "stereo",
                -12.0 // music 12dB lower than narration
            );
        }
    }
}
