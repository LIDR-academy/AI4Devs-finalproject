package com.hexagonal.meditation.generation.domain.model;

import com.hexagonal.meditation.generation.domain.enums.GenerationStatus;
import com.hexagonal.meditation.generation.domain.enums.MediaType;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for MeditationOutput aggregate root.
 * TDD approach - validates factories, state transitions, and business rules.
 */
class MeditationOutputTest {

    private static final Clock FIXED_CLOCK = Clock.fixed(
        Instant.parse("2026-02-12T10:00:00Z"),
        ZoneId.of("UTC")
    );

    @Test
    void shouldCreateAudioMeditationWithFactory() {
        UUID compositionId = UUID.randomUUID();
        String userId = "user-123";
        String text = "Close your eyes and breathe";
        MediaReference music = new MediaReference("calm-ocean");
        
        MeditationOutput output = MeditationOutput.createAudio(
            compositionId, userId, text, music, FIXED_CLOCK
        );
        
        assertNotNull(output);
        assertNotNull(output.id());
        assertEquals(compositionId, output.compositionId());
        assertEquals(userId, output.userId());
        assertEquals(MediaType.AUDIO, output.type());
        assertEquals(text, output.textSnapshot());
        assertEquals(music, output.musicReference());
        assertTrue(output.imageReference().isEmpty());
        assertTrue(output.mediaUrl().isEmpty());
        assertTrue(output.subtitleUrl().isEmpty());
        assertTrue(output.durationSeconds().isEmpty());
        assertEquals(GenerationStatus.PROCESSING, output.status());
        assertEquals(FIXED_CLOCK.instant(), output.createdAt());
        assertEquals(FIXED_CLOCK.instant(), output.updatedAt());
    }

    @Test
    void shouldCreateVideoMeditationWithFactory() {
        UUID compositionId = UUID.randomUUID();
        String userId = "user-456";
        String text = "Welcome to your meditation";
        MediaReference music = new MediaReference("nature-sounds");
        MediaReference image = new MediaReference("peaceful-landscape");
        
        MeditationOutput output = MeditationOutput.createVideo(
            compositionId, userId, text, music, image, FIXED_CLOCK
        );
        
        assertNotNull(output);
        assertNotNull(output.id());
        assertEquals(compositionId, output.compositionId());
        assertEquals(userId, output.userId());
        assertEquals(MediaType.VIDEO, output.type());
        assertEquals(text, output.textSnapshot());
        assertEquals(music, output.musicReference());
        assertTrue(output.imageReference().isPresent());
        assertEquals(image, output.imageReference().get());
        assertTrue(output.mediaUrl().isEmpty());
        assertTrue(output.subtitleUrl().isEmpty());
        assertTrue(output.durationSeconds().isEmpty());
        assertEquals(GenerationStatus.PROCESSING, output.status());
    }

    @Test
    void shouldRejectVideoWithoutImage() {
        UUID id = UUID.randomUUID();
        UUID compositionId = UUID.randomUUID();
        MediaReference music = new MediaReference("music");
        
        assertThrows(IllegalArgumentException.class, () -> {
            new MeditationOutput(
                id,
                compositionId,
                "user-123",
                MediaType.VIDEO,
                "Text",
                music,
                java.util.Optional.empty(), // VIDEO requires image
                java.util.Optional.empty(),
                java.util.Optional.empty(),
                java.util.Optional.empty(),
                GenerationStatus.PROCESSING,
                FIXED_CLOCK.instant(),
                FIXED_CLOCK.instant()
            );
        });
    }

    @Test
    void shouldMarkAsCompleted() {
        MeditationOutput processing = MeditationOutput.createAudio(
            UUID.randomUUID(),
            "user-123",
            "Text",
            new MediaReference("music"),
            FIXED_CLOCK
        );
        
        Clock laterClock = Clock.fixed(
            Instant.parse("2026-02-12T10:05:00Z"),
            ZoneId.of("UTC")
        );
        
        MeditationOutput completed = processing.markCompleted(
            "https://s3.aws/media.mp3",
            "https://s3.aws/subs.srt",
            180,
            laterClock
        );
        
        assertEquals(GenerationStatus.COMPLETED, completed.status());
        assertTrue(completed.mediaUrl().isPresent());
        assertEquals("https://s3.aws/media.mp3", completed.mediaUrl().get());
        assertTrue(completed.subtitleUrl().isPresent());
        assertEquals("https://s3.aws/subs.srt", completed.subtitleUrl().get());
        assertTrue(completed.durationSeconds().isPresent());
        assertEquals(180, completed.durationSeconds().get());
        assertEquals(laterClock.instant(), completed.updatedAt());
        assertEquals(FIXED_CLOCK.instant(), completed.createdAt()); // unchanged
    }

    @Test
    void shouldMarkAsFailed() {
        MeditationOutput processing = MeditationOutput.createAudio(
            UUID.randomUUID(),
            "user-123",
            "Text",
            new MediaReference("music"),
            FIXED_CLOCK
        );
        
        Clock laterClock = Clock.fixed(
            Instant.parse("2026-02-12T10:10:00Z"),
            ZoneId.of("UTC")
        );
        
        MeditationOutput failed = processing.markFailed(laterClock);
        
        assertEquals(GenerationStatus.FAILED, failed.status());
        assertEquals(laterClock.instant(), failed.updatedAt());
        assertTrue(failed.mediaUrl().isEmpty());
        assertTrue(failed.subtitleUrl().isEmpty());
    }

    @Test
    void shouldMarkAsTimeout() {
        MeditationOutput processing = MeditationOutput.createAudio(
            UUID.randomUUID(),
            "user-123",
            "Text",
            new MediaReference("music"),
            FIXED_CLOCK
        );
        
        Clock laterClock = Clock.fixed(
            Instant.parse("2026-02-12T10:15:00Z"),
            ZoneId.of("UTC")
        );
        
        MeditationOutput timeout = processing.markTimeout(laterClock);
        
        assertEquals(GenerationStatus.TIMEOUT, timeout.status());
        assertEquals(laterClock.instant(), timeout.updatedAt());
    }

    @Test
    void shouldCheckIfCompleted() {
        MeditationOutput processing = MeditationOutput.createAudio(
            UUID.randomUUID(),
            "user-123",
            "Text",
            new MediaReference("music"),
            FIXED_CLOCK
        );
        
        assertFalse(processing.isCompleted());
        
        MeditationOutput completed = processing.markCompleted(
            "url",
            "subtitle-url",
            60,
            FIXED_CLOCK
        );
        
        assertTrue(completed.isCompleted());
    }

    @Test
    void shouldCheckIfProcessing() {
        MeditationOutput output = MeditationOutput.createAudio(
            UUID.randomUUID(),
            "user-123",
            "Text",
            new MediaReference("music"),
            FIXED_CLOCK
        );
        
        assertTrue(output.isProcessing());
        assertFalse(output.markCompleted("url", "sub", 60, FIXED_CLOCK).isProcessing());
    }

    @Test
    void shouldCheckIfFailed() {
        MeditationOutput processing = MeditationOutput.createAudio(
            UUID.randomUUID(),
            "user-123",
            "Text",
            new MediaReference("music"),
            FIXED_CLOCK
        );
        
        assertFalse(processing.hasFailed());
        
        assertTrue(processing.markFailed(FIXED_CLOCK).hasFailed());
        assertTrue(processing.markTimeout(FIXED_CLOCK).hasFailed());
    }

    @Test
    void shouldRejectNullId() {
        assertThrows(IllegalArgumentException.class, () -> {
            new MeditationOutput(
                null,
                UUID.randomUUID(),
                "user",
                MediaType.AUDIO,
                "text",
                new MediaReference("music"),
                java.util.Optional.empty(),
                java.util.Optional.empty(),
                java.util.Optional.empty(),
                java.util.Optional.empty(),
                GenerationStatus.PROCESSING,
                FIXED_CLOCK.instant(),
                FIXED_CLOCK.instant()
            );
        });
    }

    @Test
    void shouldRejectNullUserId() {
        assertThrows(IllegalArgumentException.class, () -> {
            MeditationOutput.createAudio(
                UUID.randomUUID(),
                null,
                "text",
                new MediaReference("music"),
                FIXED_CLOCK
            );
        });
    }

    @Test
    void shouldRejectBlankUserId() {
        assertThrows(IllegalArgumentException.class, () -> {
            MeditationOutput.createAudio(
                UUID.randomUUID(),
                "  ",
                "text",
                new MediaReference("music"),
                FIXED_CLOCK
            );
        });
    }

    @Test
    void shouldRejectNullTextSnapshot() {
        assertThrows(IllegalArgumentException.class, () -> {
            MeditationOutput.createAudio(
                UUID.randomUUID(),
                "user",
                null,
                new MediaReference("music"),
                FIXED_CLOCK
            );
        });
    }

    @Test
    void shouldRejectNullMusicReference() {
        assertThrows(IllegalArgumentException.class, () -> {
            MeditationOutput.createAudio(
                UUID.randomUUID(),
                "user",
                "text",
                null,
                FIXED_CLOCK
            );
        });
    }

    @Test
    void shouldPreserveIdAcrossStateTransitions() {
        MeditationOutput original = MeditationOutput.createAudio(
            UUID.randomUUID(),
            "user-123",
            "Text",
            new MediaReference("music"),
            FIXED_CLOCK
        );
        
        UUID originalId = original.id();
        
        MeditationOutput completed = original.markCompleted("url", "sub", 60, FIXED_CLOCK);
        MeditationOutput failed = original.markFailed(FIXED_CLOCK);
        MeditationOutput timeout = original.markTimeout(FIXED_CLOCK);
        
        assertEquals(originalId, completed.id());
        assertEquals(originalId, failed.id());
        assertEquals(originalId, timeout.id());
    }
}
