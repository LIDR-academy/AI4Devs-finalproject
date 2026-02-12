package com.hexagonal.meditation.generation.domain.ports.out;

import com.hexagonal.meditation.generation.domain.model.NarrationScript;

import java.nio.file.Path;

/**
 * Output port for voice synthesis (Text-to-Speech).
 * Driven port for external TTS service integration.
 * 
 * Hexagonal Architecture - Driven Port (Domain → Infrastructure)
 * BC: Generation
 * 
 * Implementation: GoogleTtsAdapter (Google Cloud TTS API)
 */
public interface VoiceSynthesisPort {

    /**
     * Synthesize narration audio from meditation text.
     * 
     * @param script narration script with text content
     * @param voiceConfig voice configuration (language, speed, pitch)
     * @return path to generated audio file (temporary)
     * @throws com.hexagonal.meditation.generation.domain.exception.InvalidContentException if TTS service rejects text
     * @throws RuntimeException if TTS service is unavailable or fails
     */
    Path synthesizeVoice(NarrationScript script, VoiceConfig voiceConfig);

    /**
     * Voice configuration for TTS.
     */
    record VoiceConfig(
        String languageCode,
        String voiceName,
        double speakingRate,
        double pitch
    ) {
        public VoiceConfig {
            if (languageCode == null || languageCode.isBlank()) {
                throw new IllegalArgumentException("Language code cannot be null or blank");
            }
            if (voiceName == null || voiceName.isBlank()) {
                throw new IllegalArgumentException("Voice name cannot be null or blank");
            }
            if (speakingRate <= 0 || speakingRate > 4.0) {
                throw new IllegalArgumentException("Speaking rate must be between 0 and 4.0");
            }
            if (pitch < -20.0 || pitch > 20.0) {
                throw new IllegalArgumentException("Pitch must be between -20.0 and 20.0");
            }
        }

        /**
         * Default Spanish meditation voice configuration.
         */
        public static VoiceConfig spanishMeditationVoice() {
            return new VoiceConfig(
                "es-ES",
                "es-ES-Neural2-Diana",
                0.85, // slower for meditation
                0.0   // neutral pitch
            );
        }
    }
}
