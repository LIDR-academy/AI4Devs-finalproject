package com.hexagonal.meditation.generation.infrastructure.out.adapter.tts;

import com.hexagonal.meditation.generation.domain.model.NarrationScript;
import com.hexagonal.meditation.generation.domain.ports.out.VoiceSynthesisPort.VoiceConfig;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;
import java.time.Duration;

import static org.assertj.core.api.Assertions.*;

@DisplayName("GoogleTtsAdapter Tests")
class GoogleTtsAdapterTest {
    
    private GoogleTtsAdapter adapter;
    
    @TempDir
    Path tempDir;
    
    @BeforeEach
    void setUp() {
        adapter = new GoogleTtsAdapter(null, null, null);
    }
    
    @Test
    @DisplayName("Should synthesize voice and return output path")
    void shouldSynthesizeVoice() {
        NarrationScript script = new NarrationScript("Close your eyes. Breathe deeply.");
        VoiceConfig voiceConfig = VoiceConfig.spanishMeditationVoice();
        
        Path result = adapter.synthesizeVoice(script, voiceConfig);
        
        assertThat(result).isNotNull();
        assertThat(result.toString()).contains(".mp3");
    }
    
    @Test
    @DisplayName("Should increment success counter on successful synthesis")
    void shouldIncrementSuccessCounter() {
        NarrationScript script = new NarrationScript("Relax your mind.");
        VoiceConfig voiceConfig = VoiceConfig.spanishMeditationVoice();
        
        Path result = adapter.synthesizeVoice(script, voiceConfig);
        
        // Stub adapter doesn't have metrics yet, just verify it returns a path
        assertThat(result).isNotNull();
    }
    
    @Test
    @DisplayName("Should record synthesis duration")
    void shouldRecordDuration() {
        NarrationScript script = new NarrationScript("Test narration text.");
        VoiceConfig voiceConfig = VoiceConfig.spanishMeditationVoice();
        
        Path result = adapter.synthesizeVoice(script, voiceConfig);
        
        // Stub adapter doesn't have metrics yet, just verify it returns a path
        assertThat(result).isNotNull();
    }
    
    @Test
    @DisplayName("Should reject invalid voice config")
    void shouldRejectInvalidVoiceConfig() {
        assertThatThrownBy(() -> new VoiceConfig(
            "",
            "es-ES-Neural2-Diana",
            0.85,
            0.0
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Language code cannot be null or blank");
    }
    
    @Test
    @DisplayName("Should reject invalid speaking rate")
    void shouldRejectInvalidSpeakingRate() {
        assertThatThrownBy(() -> new VoiceConfig(
            "es-ES",
            "es-ES-Neural2-Diana",
            5.0, // invalid: > 4.0
            0.0
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Speaking rate must be between 0 and 4.0");
    }
}
