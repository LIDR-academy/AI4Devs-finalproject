package com.hexagonal.meditation.generation.domain.port.out;

import com.hexagonal.meditation.generation.domain.model.NarrationScript;

import java.nio.file.Path;
import java.time.Duration;

/**
 * Port for voice synthesis (Text-to-Speech) external service.
 * Implementations should integrate with TTS providers like Google Cloud TTS.
 */
public interface VoiceSynthesisPort {
    
    /**
     * Synthesize voice from narration script to audio file.
     * 
     * @param script narration script containing text to synthesize
     * @param outputPath path where synthesized audio should be saved
     * @return actual path of synthesized audio file
     * @throws RuntimeException if synthesis fails
     */
    Path synthesizeVoice(NarrationScript script, Path outputPath);
    
    /**
     * Estimate duration of synthesized audio from text.
     * 
     * @param text text to estimate duration for
     * @return estimated audio duration
     */
    Duration estimateDuration(String text);
}
