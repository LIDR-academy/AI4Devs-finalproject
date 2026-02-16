package com.hexagonal.playback.domain.model;

/**
 * Value Object containing URLs to access generated multimedia content.
 * 
 * Business Rules:
 * - At least one of audioUrl or videoUrl must be provided
 * - URLs point to S3 storage (managed by meditation.generation BC)
 * - Subtitles are optional
 * 
 * Immutability: Java 21 record ensures all fields are final
 * 
 * @param audioUrl URL to audio file (podcast format), nullable
 * @param videoUrl URL to video file (video format), nullable
 * @param subtitlesUrl URL to subtitles file (SRT format), nullable
 */
public record MediaUrls(
    String audioUrl,
    String videoUrl,
    String subtitlesUrl
) {
    
    /**
     * Compact constructor with validation.
     * 
     * @throws IllegalArgumentException if both audioUrl and videoUrl are null or blank
     */
    public MediaUrls {
        // Normalize blank strings to null for consistency
        audioUrl = (audioUrl != null && audioUrl.isBlank()) ? null : audioUrl;
        videoUrl = (videoUrl != null && videoUrl.isBlank()) ? null : videoUrl;
        
        // Business Rule: At least one media URL must be provided
        if (audioUrl == null && videoUrl == null) {
            throw new IllegalArgumentException("At least one of audioUrl or videoUrl must be provided");
        }
    }

    /**
     * Checks if this meditation has audio content.
     * 
     * @return true if audioUrl is present, false otherwise
     */
    public boolean hasAudio() {
        return audioUrl != null && !audioUrl.isBlank();
    }

    /**
     * Checks if this meditation has video content.
     * 
     * @return true if videoUrl is present, false otherwise
     */
    public boolean hasVideo() {
        return videoUrl != null && !videoUrl.isBlank();
    }
}
