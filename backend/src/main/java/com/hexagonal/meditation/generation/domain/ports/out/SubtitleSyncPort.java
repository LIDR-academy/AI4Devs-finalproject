package com.hexagonal.meditation.generation.domain.ports.out;

import com.hexagonal.meditation.generation.domain.model.SubtitleSegment;

import java.nio.file.Path;
import java.util.List;

/**
 * Output port for subtitle synchronization.
 * Driven port for generating timed subtitles (SRT format).
 * 
 * Hexagonal Architecture - Driven Port (Domain → Infrastructure)
 * BC: Generation
 * 
 * Implementation: SubtitleSyncService (internal service)
 */
public interface SubtitleSyncPort {

    /**
     * Generate synchronized subtitles from narration audio.
     * Analyzes audio timing and creates subtitle segments.
     * 
     * @param narrationAudioPath path to narration audio file
     * @param text original meditation text
     * @return list of subtitle segments with timing information
     * @throws RuntimeException if subtitle generation fails
     */
    List<SubtitleSegment> generateSubtitles(Path narrationAudioPath, String text);

    /**
     * Export subtitles to SRT file format.
     * 
     * @param segments subtitle segments with timing
     * @param outputPath path where SRT file will be created
     * @return path to created SRT file
     * @throws RuntimeException if file export fails
     */
    Path exportToSrt(List<SubtitleSegment> segments, Path outputPath);
}
