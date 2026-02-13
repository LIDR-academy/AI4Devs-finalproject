package com.hexagonal.meditation.generation.infrastructure.out.adapter.storage;

import com.hexagonal.meditation.generation.domain.ports.out.MediaStoragePort.UploadRequest;
import com.hexagonal.meditation.generation.domain.ports.out.MediaStoragePort.MediaFileType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@DisplayName("S3MediaStorageAdapter Tests")
@ExtendWith(MockitoExtension.class)
class S3MediaStorageAdapterTest {
    
    @Mock
    private S3Client s3Client;
    
    private S3MediaStorageAdapter adapter;
    
    @TempDir
    Path tempDir;
    
    @BeforeEach
    void setUp() {
        // LocalStack endpoint for testing
        adapter = new S3MediaStorageAdapter(s3Client, "http://localhost:4566");
        
        // Mock S3 upload response
        when(s3Client.putObject(any(PutObjectRequest.class), any(software.amazon.awssdk.core.sync.RequestBody.class)))
            .thenReturn(PutObjectResponse.builder().build());
    }
    
    @Test
    @DisplayName("Should upload media and return LocalStack URL")
    void shouldUploadMedia() throws IOException {
        Path localFile = tempDir.resolve("video.mp4");
        Files.writeString(localFile, "test video content");
        
        String userId = UUID.randomUUID().toString();
        UUID meditationId = UUID.randomUUID();
        
        UploadRequest request = new UploadRequest(
            localFile,
            userId,
            meditationId,
            MediaFileType.VIDEO,
            3600L // 1 hour TTL
        );
        
        String url = adapter.uploadMedia(request);
        
        assertThat(url).isNotNull();
        assertThat(url).startsWith("http://localhost:4566");
        assertThat(url).contains("meditation-media");
        assertThat(url).contains(userId);
        assertThat(url).contains(meditationId.toString());
        assertThat(url).contains("video.mp4");
    }
    
    @Test
    @DisplayName("Should reject null local file path")
    void shouldRejectNullFile() {
        String userId = UUID.randomUUID().toString();
        UUID meditationId = UUID.randomUUID();
        
        assertThatThrownBy(() -> new UploadRequest(
            null,
            userId,
            meditationId,
            MediaFileType.VIDEO,
            3600L
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("File path cannot be null");
    }
    
    @Test
    @DisplayName("Should reject null user ID")
    void shouldRejectNullUserId() {
        Path localFile = tempDir.resolve("audio.mp3");
        UUID meditationId = UUID.randomUUID();
        
        assertThatThrownBy(() -> new UploadRequest(
            localFile,
            null,
            meditationId,
            MediaFileType.AUDIO,
            3600L
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("User ID cannot be null");
    }
    
    @Test
    @DisplayName("Should reject blank user ID")
    void shouldRejectBlankUserId() {
        Path localFile = tempDir.resolve("audio.mp3");
        UUID meditationId = UUID.randomUUID();
        
        assertThatThrownBy(() -> new UploadRequest(
            localFile,
            "",
            meditationId,
            MediaFileType.AUDIO,
            3600L
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("User ID cannot be null or blank");
    }
    
    @Test
    @DisplayName("Should reject null meditation ID")
    void shouldRejectNullMeditationId() {
        Path localFile = tempDir.resolve("audio.mp3");
        String userId = UUID.randomUUID().toString();
        
        assertThatThrownBy(() -> new UploadRequest(
            localFile,
            userId,
            null,
            MediaFileType.AUDIO,
            3600L
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Meditation ID cannot be null");
    }
    
    @Test
    @DisplayName("Should reject null media type")
    void shouldRejectNullMediaType() {
        Path localFile = tempDir.resolve("audio.mp3");
        String userId = UUID.randomUUID().toString();
        UUID meditationId = UUID.randomUUID();
        
        assertThatThrownBy(() -> new UploadRequest(
            localFile,
            userId,
            meditationId,
            null,
            3600L
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("File type cannot be null");
    }
    
    @Test
    @DisplayName("Should reject zero TTL")
    void shouldRejectZeroTtl() {
        Path localFile = tempDir.resolve("audio.mp3");
        String userId = UUID.randomUUID().toString();
        UUID meditationId = UUID.randomUUID();
        
        assertThatThrownBy(() -> new UploadRequest(
            localFile,
            userId,
            meditationId,
            MediaFileType.AUDIO,
            0L
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("TTL must be positive");
    }
    
    @Test
    @DisplayName("Should reject negative TTL")
    void shouldRejectNegativeTtl() {
        Path localFile = tempDir.resolve("audio.mp3");
        String userId = UUID.randomUUID().toString();
        UUID meditationId = UUID.randomUUID();
        
        assertThatThrownBy(() -> new UploadRequest(
            localFile,
            userId,
            meditationId,
            MediaFileType.AUDIO,
            -100L
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("TTL must be positive");
    }
}
