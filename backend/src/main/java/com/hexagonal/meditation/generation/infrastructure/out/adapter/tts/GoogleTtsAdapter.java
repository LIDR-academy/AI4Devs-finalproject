package com.hexagonal.meditation.generation.infrastructure.out.adapter.tts;

import com.hexagonal.meditation.generation.domain.model.NarrationScript;
import com.hexagonal.meditation.generation.domain.port.out.VoiceSynthesisPort;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Google Cloud Text-to-Speech adapter with retry logic and metrics.
 * Implements exponential backoff for rate limiting (HTTP 429) with max 3 retries.
 */
@Component
public class GoogleTtsAdapter implements VoiceSynthesisPort {
    
    private static final Logger logger = LoggerFactory.getLogger(GoogleTtsAdapter.class);
    private static final int MAX_RETRIES = 3;
    private static final Duration INITIAL_BACKOFF = Duration.ofSeconds(1);
    
    private final Counter synthesisSuccessCounter;
    private final Counter synthesisErrorCounter;
    private final Counter rateLimitCounter;
    private final Timer synthesisTimer;
    
    public GoogleTtsAdapter(MeterRegistry meterRegistry) {
        this.synthesisSuccessCounter = Counter.builder("tts.synthesis.success")
            .description("Successful TTS synthesis operations")
            .register(meterRegistry);
        
        this.synthesisErrorCounter = Counter.builder("tts.synthesis.error")
            .description("Failed TTS synthesis operations")
            .register(meterRegistry);
        
        this.rateLimitCounter = Counter.builder("tts.ratelimit")
            .description("TTS rate limit (429) occurrences")
            .register(meterRegistry);
        
        this.synthesisTimer = Timer.builder("tts.synthesis.duration")
            .description("TTS synthesis operation duration")
            .register(meterRegistry);
    }
    
    @Override
    public Path synthesizeVoice(NarrationScript script, Path outputPath) {
        logger.info("Synthesizing voice for script ({} chars) to: {}", 
            script.text().length(), outputPath);
        
        try {
            return synthesisTimer.recordCallable(() -> {
                int attempt = 0;
                Duration backoff = INITIAL_BACKOFF;
                
                while (attempt < MAX_RETRIES) {
                    try {
                        return synthesizeWithRetry(script, outputPath, attempt);
                    } catch (RateLimitException e) {
                        attempt++;
                        rateLimitCounter.increment();
                        
                        if (attempt >= MAX_RETRIES) {
                            logger.error("Max retries exceeded for TTS synthesis after {} attempts", attempt);
                            synthesisErrorCounter.increment();
                            throw new RuntimeException("TTS rate limit exceeded after " + MAX_RETRIES + " retries", e);
                        }
                        
                        logger.warn("Rate limit hit (429), retrying in {}ms (attempt {}/{})", 
                            backoff.toMillis(), attempt + 1, MAX_RETRIES);
                        
                        try {
                            TimeUnit.MILLISECONDS.sleep(backoff.toMillis());
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new RuntimeException("Interrupted during retry backoff", ie);
                        }
                        
                        backoff = backoff.multipliedBy(2); // Exponential backoff
                    }
                }
                
                throw new RuntimeException("Unreachable code");
            });
        } catch (Exception e) {
            logger.error("TTS synthesis failed: {}", e.getMessage(), e);
            synthesisErrorCounter.increment();
            throw new RuntimeException("TTS synthesis failed", e);
        }
    }
    
    private Path synthesizeWithRetry(NarrationScript script, Path outputPath, int attempt) {
        // TODO: Implement actual Google Cloud TTS integration
        // For now, this is a stub that simulates the operation
        logger.info("TTS synthesis attempt {} for {} chars", attempt + 1, script.text().length());
        
        // Simulate success
        synthesisSuccessCounter.increment();
        return outputPath;
    }
    
    @Override
    public Duration estimateDuration(String text) {
        // Use NarrationScript's built-in duration logic
        NarrationScript script = new NarrationScript(text);
        long seconds = (long) script.estimateDurationSeconds();
        return Duration.ofSeconds(seconds);
    }
    
    /**
     * Exception thrown when TTS service returns HTTP 429 (rate limit).
     */
    public static class RateLimitException extends RuntimeException {
        public RateLimitException(String message) {
            super(message);
        }
        
        public RateLimitException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
