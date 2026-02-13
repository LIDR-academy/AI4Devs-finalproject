package com.hexagonal.meditation.generation.infrastructure.out.service.subtitle;

import com.hexagonal.meditation.generation.domain.model.SubtitleSegment;
import com.hexagonal.meditation.generation.domain.port.out.SubtitleSyncPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * Generates synchronized SRT subtitles from narration script.
 * Ensures no overlapping segments and precise timing within 200ms tolerance.
 */
@Service
public class SubtitleSyncService implements SubtitleSyncPort {
    
    private static final Logger logger = LoggerFactory.getLogger(SubtitleSyncService.class);
    private static final double MAX_OVERLAP_MS = 200.0;
    
    @Override
    public List<SubtitleSegment> generateSubtitles(String narrationText, double totalDurationSeconds) {
        logger.info("Generating subtitles for narration (duration: {}s)", totalDurationSeconds);
        
        if (narrationText == null || narrationText.isBlank()) {
            throw new IllegalArgumentException("Narration text cannot be empty");
        }
        
        if (totalDurationSeconds <= 0) {
            throw new IllegalArgumentException("Total duration must be positive");
        }
        
        // Split text into sentences (simple heuristic: split by ., !, ?)
        String[] sentences = narrationText.split("(?<=[.!?])\\s+");
        List<SubtitleSegment> segments = new ArrayList<>();
        
        double segmentDuration = totalDurationSeconds / sentences.length;
        double currentStart = 0.0;
        
        for (int i = 0; i < sentences.length; i++) {
            String sentence = sentences[i].trim();
            if (sentence.isEmpty()) {
                continue;
            }
            
            double startTime = currentStart;
            double endTime = Math.min(currentStart + segmentDuration, totalDurationSeconds);
            
            // Ensure no overlap (gap of at least 1ms)
            if (i > 0 && segments.get(segments.size() - 1).endSeconds() >= startTime) {
                startTime = segments.get(segments.size() - 1).endSeconds() + 0.001;
            }
            
            SubtitleSegment segment = new SubtitleSegment(i + 1, startTime, endTime, sentence);
            segments.add(segment);
            
            currentStart = endTime;
        }
        
        logger.info("Generated {} subtitle segments", segments.size());
        return segments;
    }
    
    @Override
    public Path writeSrtFile(List<SubtitleSegment> segments, Path outputPath) {
        logger.info("Writing SRT file to: {}", outputPath);
        
        if (segments == null || segments.isEmpty()) {
            throw new IllegalArgumentException("Segments list cannot be empty");
        }
        
        try {
            StringBuilder srtContent = new StringBuilder();
            
            for (SubtitleSegment segment : segments) {
                srtContent.append(segment.toSrtFormat()).append(System.lineSeparator());
            }
            
            Files.writeString(outputPath, srtContent.toString());
            logger.info("Successfully wrote {} segments to SRT file", segments.size());
            
            return outputPath;
        } catch (IOException e) {
            logger.error("Failed to write SRT file: {}", outputPath, e);
            throw new RuntimeException("Failed to write SRT file", e);
        }
    }
    
    @Override
    public boolean validateTiming(List<SubtitleSegment> segments) {
        if (segments == null || segments.isEmpty()) {
            return false;
        }
        
        for (int i = 0; i < segments.size() - 1; i++) {
            SubtitleSegment current = segments.get(i);
            SubtitleSegment next = segments.get(i + 1);
            
            // Check for overlap
            double gap = (next.startSeconds() - current.endSeconds()) * 1000; // Convert to ms
            if (gap < 0 && Math.abs(gap) > MAX_OVERLAP_MS) {
                logger.warn("Overlap detected between segments {} and {}: {}ms", 
                    current.index(), next.index(), gap);
                return false;
            }
            
            // Check indexes are consecutive
            if (next.index() != current.index() + 1) {
                logger.warn("Non-consecutive indexes: {} -> {}", 
                    current.index(), next.index());
                return false;
            }
        }
        
        logger.debug("Subtitle timing validation passed for {} segments", segments.size());
        return true;
    }
}
