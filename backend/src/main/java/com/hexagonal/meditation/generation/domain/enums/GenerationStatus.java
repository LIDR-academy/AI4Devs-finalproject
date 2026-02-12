package com.hexagonal.meditation.generation.domain.enums;

/**
 * Generation status for meditation content processing.
 * Tracks lifecycle from processing to completion or failure.
 * 
 * Domain Layer - BC: Generation
 * Immutable enum following DDD principles.
 */
public enum GenerationStatus {
    /**
     * Content generation in progress.
     * TTS, rendering, or storage operations ongoing.
     */
    PROCESSING,
    
    /**
     * Content generation completed successfully.
     * Media file stored and accessible via presigned URL.
     */
    COMPLETED,
    
    /**
     * Content generation failed.
     * Error during TTS, rendering, or storage.
     */
    FAILED,
    
    /**
     * Processing time exceeded threshold.
     * Request rejected before processing (>30s estimated).
     */
    TIMEOUT
}
