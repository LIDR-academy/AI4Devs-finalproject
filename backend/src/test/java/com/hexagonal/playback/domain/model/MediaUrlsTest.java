package com.hexagonal.playback.domain.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Tests for MediaUrls value object.
 * Validates immutability, validation rules, and business logic.
 */
class MediaUrlsTest {

    @Test
    void shouldCreateMediaUrlsWithAllFields() {
        // When
        MediaUrls urls = new MediaUrls(
            "https://example.com/audio.mp3",
            "https://example.com/video.mp4",
            "https://example.com/subs.srt"
        );
        
        // Then
        assertThat(urls.audioUrl()).isEqualTo("https://example.com/audio.mp3");
        assertThat(urls.videoUrl()).isEqualTo("https://example.com/video.mp4");
        assertThat(urls.subtitlesUrl()).isEqualTo("https://example.com/subs.srt");
    }

    @Test
    void shouldCreateMediaUrlsWithOnlyAudioUrl() {
        // When
        MediaUrls urls = new MediaUrls("https://example.com/audio.mp3", null, null);
        
        // Then
        assertThat(urls.audioUrl()).isEqualTo("https://example.com/audio.mp3");
        assertThat(urls.videoUrl()).isNull();
        assertThat(urls.subtitlesUrl()).isNull();
    }

    @Test
    void shouldCreateMediaUrlsWithOnlyVideoUrl() {
        // When
        MediaUrls urls = new MediaUrls(null, "https://example.com/video.mp4", null);
        
        // Then
        assertThat(urls.audioUrl()).isNull();
        assertThat(urls.videoUrl()).isEqualTo("https://example.com/video.mp4");
        assertThat(urls.subtitlesUrl()).isNull();
    }

    @Test
    void shouldThrowExceptionWhenBothAudioAndVideoAreNull() {
        // When/Then
        assertThatThrownBy(() -> new MediaUrls(null, null, null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("At least one of audioUrl or videoUrl must be provided");
    }

    @Test
    void shouldThrowExceptionWhenBothAudioAndVideoAreBlank() {
        // When/Then
        assertThatThrownBy(() -> new MediaUrls("  ", "  ", null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("At least one of audioUrl or videoUrl must be provided");
    }

    @Test
    void shouldAcceptBlankSubtitlesUrl() {
        // When
        MediaUrls urls = new MediaUrls("https://example.com/audio.mp3", null, "  ");
        
        // Then
        assertThat(urls.subtitlesUrl()).isEqualTo("  ");
    }

    @Test
    void shouldBeImmutable() {
        // Given
        MediaUrls urls = new MediaUrls(
            "https://example.com/audio.mp3",
            "https://example.com/video.mp4",
            "https://example.com/subs.srt"
        );
        
        // When/Then - Record fields are final by default
        assertThat(urls.audioUrl()).isEqualTo("https://example.com/audio.mp3");
        // No setters available - compilation would fail if attempted
    }

    @Test
    void shouldImplementEqualsBasedOnValues() {
        // Given
        MediaUrls urls1 = new MediaUrls(
            "https://example.com/audio.mp3",
            "https://example.com/video.mp4",
            "https://example.com/subs.srt"
        );
        MediaUrls urls2 = new MediaUrls(
            "https://example.com/audio.mp3",
            "https://example.com/video.mp4",
            "https://example.com/subs.srt"
        );
        
        // When/Then
        assertThat(urls1).isEqualTo(urls2);
        assertThat(urls1.hashCode()).isEqualTo(urls2.hashCode());
    }

    @Test
    void shouldNotBeEqualWhenUrlsDiffer() {
        // Given
        MediaUrls urls1 = new MediaUrls("https://example.com/audio1.mp3", null, null);
        MediaUrls urls2 = new MediaUrls("https://example.com/audio2.mp3", null, null);
        
        // When/Then
        assertThat(urls1).isNotEqualTo(urls2);
    }

    @Test
    void shouldHaveAtLeastAudioWhenCreatedForAudioMeditation() {
        // When
        MediaUrls urls = new MediaUrls("https://example.com/audio.mp3", null, null);
        
        // Then
        assertThat(urls.hasAudio()).isTrue();
        assertThat(urls.hasVideo()).isFalse();
    }

    @Test
    void shouldHaveAtLeastVideoWhenCreatedForVideoMeditation() {
        // When
        MediaUrls urls = new MediaUrls(null, "https://example.com/video.mp4", "https://example.com/subs.srt");
        
        // Then
        assertThat(urls.hasAudio()).isFalse();
        assertThat(urls.hasVideo()).isTrue();
    }

    @Test
    void shouldHaveBothAudioAndVideoWhenBothProvided() {
        // When
        MediaUrls urls = new MediaUrls(
            "https://example.com/audio.mp3",
            "https://example.com/video.mp4",
            null
        );
        
        // Then
        assertThat(urls.hasAudio()).isTrue();
        assertThat(urls.hasVideo()).isTrue();
    }

    @Test
    void shouldHaveToStringRepresentation() {
        // Given
        MediaUrls urls = new MediaUrls(
            "https://example.com/audio.mp3",
            "https://example.com/video.mp4",
            "https://example.com/subs.srt"
        );
        
        // When
        String toString = urls.toString();
        
        // Then
        assertThat(toString).contains("audioUrl=");
        assertThat(toString).contains("videoUrl=");
        assertThat(toString).contains("subtitlesUrl=");
    }
}
