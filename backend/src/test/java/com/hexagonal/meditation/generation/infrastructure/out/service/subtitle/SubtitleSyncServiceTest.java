package com.hexagonal.meditation.generation.infrastructure.out.service.subtitle;

import com.hexagonal.meditation.generation.domain.model.SubtitleSegment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

@DisplayName("SubtitleSyncService Tests")
class SubtitleSyncServiceTest {
    
    private SubtitleSyncService service;
    
    @TempDir
    Path tempDir;
    
    @BeforeEach
    void setUp() {
        service = new SubtitleSyncService();
    }
    
    @Test
    @DisplayName("Should generate subtitles from narration text")
    void shouldGenerateSubtitles() {
        String narration = "Breathe in deeply. Hold for three seconds. Breathe out slowly.";
        double duration = 10.0;
        
        List<SubtitleSegment> segments = service.generateSubtitles(narration, duration);
        
        assertThat(segments).hasSize(3);
        assertThat(segments.get(0).text()).isEqualTo("Breathe in deeply.");
        assertThat(segments.get(1).text()).isEqualTo("Hold for three seconds.");
        assertThat(segments.get(2).text()).isEqualTo("Breathe out slowly.");
    }
    
    @Test
    @DisplayName("Should distribute segments evenly across duration")
    void shouldDistributeSegmentsEvenly() {
        String narration = "First sentence. Second sentence.";
        double duration = 6.0;
        
        List<SubtitleSegment> segments = service.generateSubtitles(narration, duration);
        
        assertThat(segments).hasSize(2);
        assertThat(segments.get(0).startSeconds()).isEqualTo(0.0);
        assertThat(segments.get(0).endSeconds()).isCloseTo(3.0, within(0.1));
        assertThat(segments.get(1).startSeconds()).isCloseTo(3.0, within(0.1));
        assertThat(segments.get(1).endSeconds()).isCloseTo(6.0, within(0.1));
    }
    
    @Test
    @DisplayName("Should not exceed total duration")
    void shouldNotExceedTotalDuration() {
        String narration = "One. Two. Three. Four.";
        double duration = 5.0;
        
        List<SubtitleSegment> segments = service.generateSubtitles(narration, duration);
        
        assertThat(segments).isNotEmpty();
        assertThat(segments.get(segments.size() - 1).endSeconds()).isLessThanOrEqualTo(duration);
    }
    
    @Test
    @DisplayName("Should assign sequential numbers to segments")
    void shouldAssignSequentialNumbers() {
        String narration = "First. Second. Third.";
        
        List<SubtitleSegment> segments = service.generateSubtitles(narration, 9.0);
        
        assertThat(segments.get(0).index()).isEqualTo(1);
        assertThat(segments.get(1).index()).isEqualTo(2);
        assertThat(segments.get(2).index()).isEqualTo(3);
    }
    
    @Test
    @DisplayName("Should reject empty narration text")
    void shouldRejectEmptyText() {
        assertThatThrownBy(() -> service.generateSubtitles("", 10.0))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Narration text cannot be empty");
    }
    
    @Test
    @DisplayName("Should reject null narration text")
    void shouldRejectNullText() {
        assertThatThrownBy(() -> service.generateSubtitles(null, 10.0))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Narration text cannot be empty");
    }
    
    @Test
    @DisplayName("Should reject negative duration")
    void shouldRejectNegativeDuration() {
        assertThatThrownBy(() -> service.generateSubtitles("Text.", -5.0))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Total duration must be positive");
    }
    
    @Test
    @DisplayName("Should reject zero duration")
    void shouldRejectZeroDuration() {
        assertThatThrownBy(() -> service.generateSubtitles("Text.", 0.0))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Total duration must be positive");
    }
    
    @Test
    @DisplayName("Should write subtitles to SRT file")
    void shouldWriteSrtFile() throws Exception {
        List<SubtitleSegment> segments = List.of(
            new SubtitleSegment(1, 0.0, 2.5, "First subtitle."),
            new SubtitleSegment(2, 2.5, 5.0, "Second subtitle.")
        );
        Path outputPath = tempDir.resolve("test.srt");
        
        Path result = service.writeSrtFile(segments, outputPath);
        
        assertThat(result).isEqualTo(outputPath);
        assertThat(Files.exists(outputPath)).isTrue();
        
        String content = Files.readString(outputPath);
        assertThat(content).contains("1");
        assertThat(content).contains("00:00:00,000 --> 00:00:02,500");
        assertThat(content).contains("First subtitle.");
        assertThat(content).contains("2");
        assertThat(content).contains("00:00:02,500 --> 00:00:05,000");
        assertThat(content).contains("Second subtitle.");
    }
    
    @Test
    @DisplayName("Should reject empty segments list when writing SRT")
    void shouldRejectEmptySegmentsForWriting() {
        Path outputPath = tempDir.resolve("empty.srt");
        
        assertThatThrownBy(() -> service.writeSrtFile(List.of(), outputPath))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Segments list cannot be empty");
    }
    
    @Test
    @DisplayName("Should validate timing with no overlaps")
    void shouldValidateTimingWithoutOverlaps() {
        List<SubtitleSegment> segments = List.of(
            new SubtitleSegment(1, 0.0, 2.0, "First."),
            new SubtitleSegment(2, 2.001, 4.0, "Second."),
            new SubtitleSegment(3, 4.001, 6.0, "Third.")
        );
        
        boolean isValid = service.validateTiming(segments);
        
        assertThat(isValid).isTrue();
    }
    
    @Test
    @DisplayName("Should reject timing with significant overlap")
    void shouldRejectTimingWithOverlap() {
        List<SubtitleSegment> segments = List.of(
            new SubtitleSegment(1, 0.0, 2.5, "First."),
            new SubtitleSegment(2, 2.0, 4.0, "Second overlaps.") // 500ms overlap
        );
        
        boolean isValid = service.validateTiming(segments);
        
        assertThat(isValid).isFalse();
    }
    
    @Test
    @DisplayName("Should allow minor overlap within tolerance")
    void shouldAllowMinorOverlap() {
        List<SubtitleSegment> segments = List.of(
            new SubtitleSegment(1, 0.0, 2.0, "First."),
            new SubtitleSegment(2, 1.9, 4.0, "Second.") // 100ms overlap (within 200ms tolerance)
        );
        
        boolean isValid = service.validateTiming(segments);
        
        assertThat(isValid).isTrue();
    }
    
    @Test
    @DisplayName("Should reject non-consecutive sequence numbers")
    void shouldRejectNonConsecutiveSequence() {
        List<SubtitleSegment> segments = List.of(
            new SubtitleSegment(1, 0.0, 2.0, "First."),
            new SubtitleSegment(3, 2.001, 4.0, "Third (skipped 2).")
        );
        
        boolean isValid = service.validateTiming(segments);
        
        assertThat(isValid).isFalse();
    }
    
    @Test
    @DisplayName("Should return false for null segment list")
    void shouldReturnFalseForNullSegments() {
        boolean isValid = service.validateTiming(null);
        
        assertThat(isValid).isFalse();
    }
    
    @Test
    @DisplayName("Should return false for empty segment list")
    void shouldReturnFalseForEmptySegments() {
        boolean isValid = service.validateTiming(List.of());
        
        assertThat(isValid).isFalse();
    }
}
