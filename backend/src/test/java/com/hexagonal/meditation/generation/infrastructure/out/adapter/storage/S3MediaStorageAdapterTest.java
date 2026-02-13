package com.hexagonal.meditation.generation.infrastructure.out.adapter.storage;

import com.hexagonal.meditation.generation.domain.model.MediaReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DisplayName("S3MediaStorageAdapter Tests")
class S3MediaStorageAdapterTest {
    
    private S3MediaStorageAdapter adapter;
    
    @TempDir
    Path tempDir;
    
    @BeforeEach
    void setUp() {
        adapter = new S3MediaStorageAdapter();
    }
    
    @Test
    @DisplayName("Should upload media and return S3 reference")
    void shouldUploadMedia() {
        Path localFile = tempDir.resolve("video.mp4");
        UUID userId = UUID.randomUUID();
        UUID meditationId = UUID.randomUUID();
        
        MediaReference result = adapter.uploadMedia(localFile, userId, meditationId, "video/mp4");
        
        assertThat(result).isNotNull();
        assertThat(result.url()).startsWith("s3://");
        assertThat(result.url()).contains(userId.toString());
        assertThat(result.url()).contains(meditationId.toString());
        assertThat(result.url()).contains("video.mp4");
        assertThat(result.isS3()).isTrue();
    }
    
    @Test
    @DisplayName("Should reject null local file path")
    void shouldRejectNullFile() {
        UUID userId = UUID.randomUUID();
        UUID meditationId = UUID.randomUUID();
        
        assertThatThrownBy(() -> adapter.uploadMedia(null, userId, meditationId, "video/mp4"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Local file path cannot be null");
    }
    
    @Test
    @DisplayName("Should reject null user ID")
    void shouldRejectNullUserId() {
        Path localFile = tempDir.resolve("audio.mp3");
        UUID meditationId = UUID.randomUUID();
        
        assertThatThrownBy(() -> adapter.uploadMedia(localFile, null, meditationId, "audio/mpeg"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("User ID cannot be null");
    }
    
    @Test
    @DisplayName("Should reject null meditation ID")
    void shouldRejectNullMeditationId() {
        Path localFile = tempDir.resolve("audio.mp3");
        UUID userId = UUID.randomUUID();
        
        assertThatThrownBy(() -> adapter.uploadMedia(localFile, userId, null, "audio/mpeg"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Meditation ID cannot be null");
    }
    
    @Test
    @DisplayName("Should reject null media type")
    void shouldRejectNullMediaType() {
        Path localFile = tempDir.resolve("audio.mp3");
        UUID userId = UUID.randomUUID();
        UUID meditationId = UUID.randomUUID();
        
        assertThatThrownBy(() -> adapter.uploadMedia(localFile, userId, meditationId, null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Media type cannot be null or empty");
    }
    
    @Test
    @DisplayName("Should reject empty media type")
    void shouldRejectEmptyMediaType() {
        Path localFile = tempDir.resolve("audio.mp3");
        UUID userId = UUID.randomUUID();
        UUID meditationId = UUID.randomUUID();
        
        assertThatThrownBy(() -> adapter.uploadMedia(localFile, userId, meditationId, ""))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Media type cannot be null or empty");
    }
    
    @Test
    @DisplayName("Should download media from S3 reference")
    void shouldDownloadMedia() {
        MediaReference s3Ref = new MediaReference("s3://meditation-media/generation/user123/med456/video.mp4");
        Path destination = tempDir.resolve("downloaded-video.mp4");
        
        Path result = adapter.downloadMedia(s3Ref, destination);
        
        assertThat(result).isEqualTo(destination);
    }
    
    @Test
    @DisplayName("Should reject download of non-S3 reference")
    void shouldRejectNonS3Download() {
        MediaReference httpRef = new MediaReference("https://example.com/video.mp4");
        Path destination = tempDir.resolve("video.mp4");
        
        assertThatThrownBy(() -> adapter.downloadMedia(httpRef, destination))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Media reference is not an S3 URL");
    }
    
    @Test
    @DisplayName("Should delete media from S3")
    void shouldDeleteMedia() {
        MediaReference s3Ref = new MediaReference("s3://meditation-media/generation/user123/med456/audio.mp3");
        
        assertThatCode(() -> adapter.deleteMedia(s3Ref))
            .doesNotThrowAnyException();
    }
    
    @Test
    @DisplayName("Should ignore delete for non-S3 reference")
    void shouldIgnoreNonS3Delete() {
        MediaReference localRef = new MediaReference("file:///tmp/audio.mp3");
        
        assertThatCode(() -> adapter.deleteMedia(localRef))
            .doesNotThrowAnyException();
    }
    
    @Test
    @DisplayName("Should check if S3 media exists")
    void shouldCheckExists() {
        MediaReference s3Ref = new MediaReference("s3://meditation-media/generation/user123/med456/video.mp4");
        
        boolean exists = adapter.exists(s3Ref);
        
        // Stub implementation always returns true
        assertThat(exists).isTrue();
    }
    
    @Test
    @DisplayName("Should return false for non-S3 reference existence check")
    void shouldReturnFalseForNonS3Exists() {
        MediaReference httpRef = new MediaReference("https://example.com/video.mp4");
        
        boolean exists = adapter.exists(httpRef);
        
        assertThat(exists).isFalse();
    }
}
