package com.hexagonal.meditation.generation.domain.model;

/**
 * Value Object representing a subtitle segment with timing information.
 * Used to create synchronized subtitles (SRT format).
 * 
 * Domain Layer - BC: Generation
 * Immutable record with validation (Java 21).
 */
public record SubtitleSegment(
    int index,
    double startSeconds,
    double endSeconds,
    String text
) {
    
    /**
     * Compact constructor with validation.
     */
    public SubtitleSegment {
        if (index < 1) {
            throw new IllegalArgumentException("Subtitle index must be >= 1");
        }
        if (startSeconds < 0) {
            throw new IllegalArgumentException("Start time cannot be negative");
        }
        if (endSeconds <= startSeconds) {
            throw new IllegalArgumentException("End time must be greater than start time (start: " + startSeconds + ", end: " + endSeconds + ")");
        }
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Subtitle text cannot be null or blank");
        }
    }

    /**
     * Checks if this segment overlaps with another segment.
     * 
     * @param other the other segment to check
     * @return true if segments overlap, false otherwise
     */
    public boolean overlapsWith(SubtitleSegment other) {
        return this.startSeconds < other.endSeconds && this.endSeconds > other.startSeconds;
    }

    /**
     * Formats segment as SRT entry.
     * Format:
     * index
     * hh:mm:ss,mmm --> hh:mm:ss,mmm
     * text
     * 
     * @return SRT formatted string
     */
    public String toSrtFormat() {
        return String.format("%d%n%s --> %s%n%s%n",
            index,
            formatTimestamp(startSeconds),
            formatTimestamp(endSeconds),
            text
        );
    }

    private String formatTimestamp(double seconds) {
        int hours = (int) (seconds / 3600);
        int minutes = (int) ((seconds % 3600) / 60);
        int secs = (int) (seconds % 60);
        int millis = (int) Math.round((seconds % 1) * 1000);
        
        return String.format("%02d:%02d:%02d,%03d", hours, minutes, secs, millis);
    }
}
