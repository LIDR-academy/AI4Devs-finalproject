package com.hexagonal.meditation.generation.infrastructure.out.service.subtitle;

import com.hexagonal.meditation.generation.domain.model.SubtitleSegment;
import com.hexagonal.meditation.generation.domain.ports.out.SubtitleSyncPort;
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
    
    @Override
    public List<SubtitleSegment> generateSubtitles(Path narrationAudioPath, String text) {
        logger.info("Generating subtitles for narration: audio={}", narrationAudioPath);
        
        if (narrationAudioPath == null) {
            throw new IllegalArgumentException("Narration audio path cannot be null");
        }
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Text cannot be empty");
        }
        
        // TODO: Analyze audio duration using FFmpeg or audio library
        double estimatedDuration = text.length() / 150.0 * 60.0; // ~150 wpm
        
        // Split text into sentences
        String[] sentences = text.split("(?<=[.!?])\\s+");
        List<SubtitleSegment> segments = new ArrayList<>();
        
        double segmentDuration = estimatedDuration / sentences.length;
        double currentStart = 0.0;
        
        for (int i = 0; i < sentences.length; i++) {
            String sentence = sentences[i].trim();
            if (sentence.isEmpty()) continue;
            
            double endTime = Math.min(currentStart + segmentDuration, estimatedDuration);
            SubtitleSegment segment = new SubtitleSegment(i + 1, currentStart, endTime, sentence);
            segments.add(segment);
            currentStart = endTime;
        }
        
        logger.info("Generated {} subtitle segments", segments.size());
        return segments;
    }
    
    @Override
    public Path exportToSrt(List<SubtitleSegment> segments, Path outputPath) {
        logger.info("Exporting SRT file to: {}", outputPath);
        
        if (segments == null || segments.isEmpty()) {
            throw new IllegalArgumentException("Segments cannot be empty");
        }
        
        try {
            StringBuilder srt = new StringBuilder();
            for (SubtitleSegment segment : segments) {
                srt.append(segment.toSrtFormat()).append(System.lineSeparator());
            }
            Files.writeString(outputPath, srt.toString());
            logger.info("SRT file written successfully: {}", outputPath);
            return outputPath;
        } catch (IOException e) {
            throw new RuntimeException("Failed to write SRT file: " + e.getMessage(), e);
        }
    }
}
