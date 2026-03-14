package com.hexagonal.meditation.generation.infrastructure.out.service.file;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DisplayName("TempFileManager Tests")
class TempFileManagerTest {
    
    private TempFileManager tempFileManager;
    
    @BeforeEach
    void setUp() {
        tempFileManager = new TempFileManager();
    }
    
    @AfterEach
    void tearDown() {
        tempFileManager.cleanupAll();
    }
    
    @Test
    @DisplayName("Should create base temporary directory")
    void shouldCreateBaseDirectory() {
        Path baseDir = tempFileManager.getBaseDirectory();
        
        assertThat(baseDir).isNotNull();
        assertThat(Files.exists(baseDir)).isTrue();
        assertThat(Files.isDirectory(baseDir)).isTrue();
    }
    
    @Test
    @DisplayName("Should create temporary file with prefix and extension")
    void shouldCreateTempFile() {
        Path tempFile = tempFileManager.createTempFile("tts-audio", ".mp3");
        
        assertThat(tempFile).isNotNull();
        assertThat(Files.exists(tempFile)).isTrue();
        assertThat(tempFile.getFileName().toString()).startsWith("tts-audio");
        assertThat(tempFile.getFileName().toString()).endsWith(".mp3");
    }
    
    @Test
    @DisplayName("Should create session directory")
    void shouldCreateSessionDirectory() {
        UUID sessionId = UUID.randomUUID();
        
        Path sessionDir = tempFileManager.createSessionDirectory(sessionId);
        
        assertThat(sessionDir).isNotNull();
        assertThat(Files.exists(sessionDir)).isTrue();
        assertThat(Files.isDirectory(sessionDir)).isTrue();
        assertThat(sessionDir.getFileName().toString()).contains(sessionId.toString());
    }
    
    @Test
    @DisplayName("Should copy file to temporary location")
    void shouldCopyFileToTemp() throws IOException {
        // Create source file
        Path sourceFile = tempFileManager.createTempFile("source", ".txt");
        Files.writeString(sourceFile, "Test content");
        
        // Copy to new temp file
        Path copiedFile = tempFileManager.copyToTempFile(sourceFile, "copied", ".txt");
        
        assertThat(copiedFile).isNotNull();
        assertThat(Files.exists(copiedFile)).isTrue();
        assertThat(Files.readString(copiedFile)).isEqualTo("Test content");
        assertThat(copiedFile).isNotEqualTo(sourceFile);
    }
    
    @Test
    @DisplayName("Should delete temporary file")
    void shouldDeleteTempFile() {
        Path tempFile = tempFileManager.createTempFile("to-delete", ".tmp");
        assertThat(Files.exists(tempFile)).isTrue();
        
        tempFileManager.deleteTempFile(tempFile);
        
        assertThat(Files.exists(tempFile)).isFalse();
    }
    
    @Test
    @DisplayName("Should cleanup session directory")
    void shouldCleanupSession() throws IOException {
        UUID sessionId = UUID.randomUUID();
        Path sessionDir = tempFileManager.createSessionDirectory(sessionId);
        
        // Create files in session directory
        Path file1 = sessionDir.resolve("file1.txt");
        Path file2 = sessionDir.resolve("file2.txt");
        Files.createFile(file1);
        Files.createFile(file2);
        
        assertThat(Files.exists(sessionDir)).isTrue();
        assertThat(Files.exists(file1)).isTrue();
        
        tempFileManager.cleanupSession(sessionId);
        
        assertThat(Files.exists(sessionDir)).isFalse();
        assertThat(Files.exists(file1)).isFalse();
    }
    
    @Test
    @DisplayName("Should not fail when deleting non-existent file")
    void shouldHandleNonExistentFile() {
        Path nonExistent = tempFileManager.getBaseDirectory().resolve("does-not-exist.txt");
        
        assertThatCode(() -> tempFileManager.deleteTempFile(nonExistent))
            .doesNotThrowAnyException();
    }
    
    @Test
    @DisplayName("Should create unique files on each call")
    void shouldCreateUniqueFiles() {
        Path file1 = tempFileManager.createTempFile("test", ".txt");
        Path file2 = tempFileManager.createTempFile("test", ".txt");
        
        assertThat(file1).isNotEqualTo(file2);
        assertThat(Files.exists(file1)).isTrue();
        assertThat(Files.exists(file2)).isTrue();
    }
}
