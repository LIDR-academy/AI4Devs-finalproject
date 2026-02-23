package com.hexagonal.meditation.generation.domain.enums;

/**
 * Media type for generated meditation content.
 * Determines output format based on image presence.
 * 
 * Domain Layer - BC: Generation
 * Immutable enum following DDD principles.
 */
public enum MediaType {
    /**
     * Audio-only output (no image provided).
     * Narration + music, with subtitles for future use.
     */
    AUDIO,
    
    /**
     * Video output (image provided).
     * Narration + music + static image + burned subtitles.
     */
    VIDEO
}
