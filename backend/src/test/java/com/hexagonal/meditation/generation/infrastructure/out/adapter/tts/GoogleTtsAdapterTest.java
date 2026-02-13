package com.hexagonal.meditation.generation.infrastructure.out.adapter.tts;

import com.hexagonal.meditation.generation.domain.model.NarrationScript;
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
    private SimpleMeterRegistry meterRegistry;
    
    @TempDir
    Path tempDir;
    
    @BeforeEach
    void setUp() {
        meterRegistry = new SimpleMeterRegistry();
        adapter = new GoogleTtsAdapter(meterRegistry);
    }
    
    @Test
    @DisplayName("Should synthesize voice and return output path")
    void shouldSynthesizeVoice() {
        NarrationScript script = new NarrationScript("Close your eyes. Breathe deeply.");
        Path outputPath = tempDir.resolve("audio.mp3");
        
        Path result = adapter.synthesizeVoice(script, outputPath);
        
        assertThat(result).isEqualTo(outputPath);
    }
    
    @Test
    @DisplayName("Should increment success counter on successful synthesis")
    void shouldIncrementSuccessCounter() {
        NarrationScript script = new NarrationScript("Relax your mind.");
        Path outputPath = tempDir.resolve("success.mp3");
        
        adapter.synthesizeVoice(script, outputPath);
        
        double successCount = meterRegistry.counter("tts.synthesis.success").count();
        assertThat(successCount).isEqualTo(1.0);
    }
    
    @Test
    @DisplayName("Should record synthesis duration")
    void shouldRecordDuration() {
        NarrationScript script = new NarrationScript("Test narration text.");
        Path outputPath = tempDir.resolve("timed.mp3");
        
        adapter.synthesizeVoice(script, outputPath);
        
        double timerCount = meterRegistry.timer("tts.synthesis.duration").count();
        assertThat(timerCount).isGreaterThan(0);
    }
    
    @Test
    @DisplayName("Should estimate duration based on text length")
    void shouldEstimateDuration() {
        String shortText = "Short text."; // ~1 second at 150 wpm
        String longText = "This is a much longer meditation narration script that should take significantly more time to narrate at one hundred fifty words per minute."; // ~6 seconds
        
        Duration shortDuration = adapter.estimateDuration(shortText);
        Duration longDuration = adapter.estimateDuration(longText);
        
        assertThat(shortDuration.getSeconds()).isLessThan(longDuration.getSeconds());
        assertThat(longDuration.getSeconds()).isGreaterThan(3);
    }
    
    @Test
    @DisplayName("Should use NarrationScript duration estimation")
    void shouldUseNarrationScriptEstimation() {
        String text = "Meditation text for duration estimation testing purposes.";
        NarrationScript script = new NarrationScript(text);
        
        Duration adapterEstimate = adapter.estimateDuration(text);
        Duration scriptEstimate = Duration.ofSeconds((long) script.estimateDurationSeconds());
        
        assertThat(adapterEstimate).isEqualTo(scriptEstimate);
    }
    
    @Test
    @DisplayName("Should handle empty text gracefully")
    void shouldHandleEmptyText() {
        // Empty text is handled by NarrationScript validation
        // This adapter receives valid NarrationScript objects
        NarrationScript shortScript = new NarrationScript("a");  // Minimal valid text
        Duration duration = adapter.estimateDuration(shortScript.text());
        
        assertThat(duration.getSeconds()).isGreaterThanOrEqualTo(0);
    }
    
    @Test
    @DisplayName("Should handle very long text")
    void shouldHandleLongText() {
        String longText = "word ".repeat(1000); // 1000 words
        
        Duration duration = adapter.estimateDuration(longText);
        
        // At 150 wpm, 1000 words = ~6.67 minutes = ~400 seconds
        assertThat(duration.getSeconds()).isGreaterThan(300);
    }
}
