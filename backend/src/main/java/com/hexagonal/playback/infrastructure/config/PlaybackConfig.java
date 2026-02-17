package com.hexagonal.playback.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

/**
 * Spring configuration for Playback BC beans.
 * 
 * Provides:
 * - Clock bean for timestamp generation (testable, injectable)
 */
@Configuration
public class PlaybackConfig {

    /**
     * Provides system UTC Clock bean.
     * Injectable for testing (can be mocked/fixed).
     * 
     * @return Clock instance using system UTC time
     */
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
