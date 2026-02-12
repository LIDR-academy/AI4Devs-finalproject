package com.hexagonal.meditation.generation.domain.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for SubtitleSegment value object.
 * TDD approach - validates timing constraints and SRT formatting.
 */
class SubtitleSegmentTest {

    @Test
    void shouldCreateSubtitleSegmentWithValidData() {
        SubtitleSegment segment = new SubtitleSegment(1, 0.0, 2.5, "Close your eyes");
        
        assertNotNull(segment);
        assertEquals(1, segment.index());
        assertEquals(0.0, segment.startSeconds());
        assertEquals(2.5, segment.endSeconds());
        assertEquals("Close your eyes", segment.text());
    }

    @Test
    void shouldRejectIndexLessThanOne() {
        assertThrows(IllegalArgumentException.class, () -> {
            new SubtitleSegment(0, 0.0, 2.0, "Test");
        });
    }

    @Test
    void shouldRejectNegativeStartTime() {
        assertThrows(IllegalArgumentException.class, () -> {
            new SubtitleSegment(1, -1.0, 2.0, "Test");
        });
    }

    @Test
    void shouldRejectEndTimeBeforeStartTime() {
        assertThrows(IllegalArgumentException.class, () -> {
            new SubtitleSegment(1, 5.0, 2.0, "Test");
        });
    }

    @Test
    void shouldRejectEqualStartAndEndTimes() {
        assertThrows(IllegalArgumentException.class, () -> {
            new SubtitleSegment(1, 2.0, 2.0, "Test");
        });
    }

    @Test
    void shouldRejectNullText() {
        assertThrows(IllegalArgumentException.class, () -> {
            new SubtitleSegment(1, 0.0, 2.0, null);
        });
    }

    @Test
    void shouldRejectBlankText() {
        assertThrows(IllegalArgumentException.class, () -> {
            new SubtitleSegment(1, 0.0, 2.0, "   ");
        });
    }

    @Test
    void shouldDetectOverlappingSegments() {
        SubtitleSegment segment1 = new SubtitleSegment(1, 0.0, 3.0, "First");
        SubtitleSegment segment2 = new SubtitleSegment(2, 2.0, 5.0, "Second");
        
        assertTrue(segment1.overlapsWith(segment2));
        assertTrue(segment2.overlapsWith(segment1));
    }

    @Test
    void shouldDetectNonOverlappingSegments() {
        SubtitleSegment segment1 = new SubtitleSegment(1, 0.0, 2.0, "First");
        SubtitleSegment segment2 = new SubtitleSegment(2, 2.0, 4.0, "Second");
        
        assertFalse(segment1.overlapsWith(segment2));
        assertFalse(segment2.overlapsWith(segment1));
    }

    @Test
    void shouldDetectAdjacentSegmentsAsNonOverlapping() {
        SubtitleSegment segment1 = new SubtitleSegment(1, 0.0, 2.5, "First");
        SubtitleSegment segment2 = new SubtitleSegment(2, 2.5, 5.0, "Second");
        
        assertFalse(segment1.overlapsWith(segment2));
        assertFalse(segment2.overlapsWith(segment1));
    }

    @Test
    void shouldFormatAsSrtEntry() {
        SubtitleSegment segment = new SubtitleSegment(1, 0.0, 2.5, "Close your eyes");
        
        String srt = segment.toSrtFormat();
        
        assertNotNull(srt);
        assertTrue(srt.contains("1"));
        assertTrue(srt.contains("00:00:00,000 --> 00:00:02,500"));
        assertTrue(srt.contains("Close your eyes"));
    }

    @Test
    void shouldFormatTimestampWithHoursMinutesSeconds() {
        SubtitleSegment segment = new SubtitleSegment(5, 3665.250, 3670.750, "Long meditation");
        
        String srt = segment.toSrtFormat();
        
        // 3665.250 seconds = 1h 1m 5s 250ms
        assertTrue(srt.contains("01:01:05,250"));
        // 3670.750 seconds = 1h 1m 10s 750ms
        assertTrue(srt.contains("01:01:10,750"));
    }

    @Test
    void shouldFormatMillisecondsPrecision() {
        SubtitleSegment segment = new SubtitleSegment(2, 1.123, 3.456, "Precise timing");
        
        String srt = segment.toSrtFormat();
        
        assertTrue(srt.contains("00:00:01,123"));
        assertTrue(srt.contains("00:00:03,456"));
    }

    @Test
    void shouldIncludeNewlinesInSrtFormat() {
        SubtitleSegment segment = new SubtitleSegment(1, 0.0, 2.0, "Test");
        
        String srt = segment.toSrtFormat();
        
        String[] lines = srt.split("\n");
        assertEquals(4, lines.length); // index, timestamp, text, blank line
    }
}
