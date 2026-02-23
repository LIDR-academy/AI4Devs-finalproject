package com.hexagonal.meditation.generation.domain.exception;

/**
 * Domain exception for generation timeout.
 * Thrown when meditation content would exceed processing time limits.
 * 
 * Domain Layer - BC: Generation
 * Maps to HTTP 408 Request Timeout in controllers.
 */
public class GenerationTimeoutException extends RuntimeException {

    private final int estimatedSeconds;
    private final int maxAllowedSeconds;

    /**
     * Create timeout exception with time estimates.
     * 
     * @param estimatedSeconds estimated processing time
     * @param maxAllowedSeconds maximum allowed processing time
     */
    public GenerationTimeoutException(int estimatedSeconds, int maxAllowedSeconds) {
        super(String.format(
            "Processing time would exceed %d seconds. Please send shorter text (estimated: %ds for current content).",
            maxAllowedSeconds,
            estimatedSeconds
        ));
        this.estimatedSeconds = estimatedSeconds;
        this.maxAllowedSeconds = maxAllowedSeconds;
    }

    /**
     * Create timeout exception with custom message.
     * 
     * @param message custom error message
     */
    public GenerationTimeoutException(String message) {
        super(message);
        this.estimatedSeconds = 0;
        this.maxAllowedSeconds = 0;
    }

    public int getEstimatedSeconds() {
        return estimatedSeconds;
    }

    public int getMaxAllowedSeconds() {
        return maxAllowedSeconds;
    }
}
