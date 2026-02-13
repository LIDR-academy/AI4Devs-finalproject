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
        Path audioPath = tempDir.resolve("narration.mp3");
        String narration = "Breathe in deeply. Hold for three seconds. Breathe out slowly.";
        
        List<SubtitleSegment> segments = service.generateSubtitles(audioPath, narration);
        
        assertThat(segments).hasSize(3);
        assertThat(segments.get(0).text()).isEqualTo("Breathe in deeply.");
        assertThat(segments.get(1).text()).isEqualTo("Hold for three seconds.");
        assertThat(segments.get(2).text()).isEqualTo("Breathe out slowly.");
    }
    
    @Test
    @DisplayName("Should distribute segments evenly across duration")
    void shouldDistributeSegmentsEvenly() {
        Path audioPath = tempDir.resolve("narration.mp3");
        String narration = "First sentence. Second sentence.";
        
        List<SubtitleSegment> segments = service.generateSubtitles(audioPath, narration);
        
        assertThat(segments).hasSize(2);
        assertThat(segments.get(0).startSeconds()).isEqualTo(0.0);
        assertThat(segments.get(0).endSeconds()).isGreaterThan(0.0);
        assertThat(segments.get(1).startSeconds()).isGreaterThan(0.0);
        assertThat(segments.get(1).endSeconds()).isGreaterThan(segments.get(1).startSeconds());
    }
    
    @Test
    @DisplayName("Should not exceed total duration")
    void shouldNotExceedTotalDuration() {
        Path audioPath = tempDir.resolve("narration.mp3");
        String narration = "One. Two. Three. Four.";
        
        List<SubtitleSegment> segments = service.generateSubtitles(audioPath, narration);
        
        assertThat(segments).isNotEmpty();
        // Segments should have valid timing
        assertThat(segments.get(segments.size() - 1).endSeconds()).isGreaterThan(0.0);
    }
    
    @Test
    @DisplayName("Should assign sequential numbers to segments")
    void shouldAssignSequentialNumbers() {
        Path audioPath = tempDir.resolve("narration.mp3");
        String narration = "First. Second. Third.";
        
        List<SubtitleSegment> segments = service.generateSubtitles(audioPath, narration);
        
        assertThat(segments.get(0).index()).isEqualTo(1);
        assertThat(segments.get(1).index()).isEqualTo(2);
        assertThat(segments.get(2).index()).isEqualTo(3);
    }
    
    @Test
    @DisplayName("Should reject empty narration text")
    void shouldRejectEmptyText() {
        Path audioPath = tempDir.resolve("narration.mp3");
        
        assertThatThrownBy(() -> service.generateSubtitles(audioPath, ""))
            .isInstanceOf(IllegalArgumentException.class);
    }
    
    @Test
    @DisplayName("Should reject null narration text")
    void shouldRejectNullText() {
        Path audioPath = tempDir.resolve("narration.mp3");
        
        assertThatThrownBy(() -> service.generateSubtitles(audioPath, null))
            .isInstanceOf(IllegalArgumentException.class);
    }
    
    @Test
    @DisplayName("Should reject null audio path")
    void shouldRejectNullAudioPath() {
        String narration = "Text.";
        
        assertThatThrownBy(() -> service.generateSubtitles(null, narration))
            .isInstanceOf(IllegalArgumentException.class);
    }
    
    @Test
    @DisplayName("Should write subtitles to SRT file")
    void shouldWriteSrtFile() throws Exception {
        List<SubtitleSegment> segments = List.of(
            new SubtitleSegment(1, 0.0, 2.5, "First subtitle."),
            new SubtitleSegment(2, 2.5, 5.0, "Second subtitle.")
        );
        Path outputPath = tempDir.resolve("test.srt");
        
        Path result = service.exportToSrt(segments, outputPath);
        
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
        
        assertThatThrownBy(() -> service.exportToSrt(List.of(), outputPath))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
