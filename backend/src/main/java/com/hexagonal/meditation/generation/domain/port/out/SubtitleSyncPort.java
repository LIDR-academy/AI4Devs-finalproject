package com.hexagonal.meditation.generation.domain.port.out;

import com.hexagonal.meditation.generation.domain.model.SubtitleSegment;

import java.nio.file.Path;
import java.util.List;

/**
 * Port for subtitle synchronization and SRT generation.
 * Implementations should generate properly timed SRT subtitles from narration text.
 */
public interface SubtitleSyncPort {
    
    /**
     * Generate subtitle segments from narration text.
     * Segments should be synchronized with narration duration.
     * 
     * @param narrationText text to convert to subtitles
     * @param totalDurationSeconds total duration of narration audio
     * @return list of subtitle segments with timing
     */
    List<SubtitleSegment> generateSubtitles(String narrationText, double totalDurationSeconds);
    
    /**
     * Write subtitle segments to SRT file format.
     * 
     * @param segments subtitle segments to write
     * @param outputPath path where SRT file should be written
     * @return actual path of written SRT file
     */
    Path writeSrtFile(List<SubtitleSegment> segments, Path outputPath);
    
    /**
     * Validate subtitle timing for overlaps and gaps.
     * 
     * @param segments subtitle segments to validate
     * @return true if timing is valid, false if overlaps detected
     */
    boolean validateTiming(List<SubtitleSegment> segments);
}
