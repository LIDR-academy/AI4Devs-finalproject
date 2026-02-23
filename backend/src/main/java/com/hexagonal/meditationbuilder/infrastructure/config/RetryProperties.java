package com.hexagonal.meditationbuilder.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for retry behavior.
 * 
 * <p>Mapped from application.yml under prefix 'retry'.
 * Used for configuring exponential backoff retry strategy
 * when external services return transient errors (429, 503).</p>
 * 
 * @param maxAttempts Maximum number of retry attempts
 * @param initialIntervalMs Initial wait time before first retry
 * @param multiplier Exponential backoff multiplier
 * @param maxIntervalMs Maximum wait time between retries
 */
@ConfigurationProperties(prefix = "retry")
public record RetryProperties(
        int maxAttempts,
        long initialIntervalMs,
        double multiplier,
        long maxIntervalMs
) {
    
    public RetryProperties {
        if (maxAttempts <= 0) {
            maxAttempts = 3;
        }
        if (initialIntervalMs <= 0) {
            initialIntervalMs = 1000;
        }
        if (multiplier <= 0) {
            multiplier = 2.0;
        }
        if (maxIntervalMs <= 0) {
            maxIntervalMs = 10000;
        }
    }
}
