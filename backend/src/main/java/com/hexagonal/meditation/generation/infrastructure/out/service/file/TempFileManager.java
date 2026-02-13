package com.hexagonal.meditation.generation.infrastructure.out.service.file;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Manages temporary files for meditation generation process.
 * Provides cleanup and lifecycle management for intermediate files (TTS audio, subtitles, rendered media).
 */
@Service
public class TempFileManager {
    
    private static final Logger logger = LoggerFactory.getLogger(TempFileManager.class);
    private static final String TEMP_DIR_PREFIX = "meditation-gen-";
    
    private final Path baseDirectory;
    
    public TempFileManager() {
        try {
            this.baseDirectory = Files.createTempDirectory(TEMP_DIR_PREFIX);
            logger.info("Temporary file manager initialized with base directory: {}", baseDirectory);
            
            // Register shutdown hook to cleanup on JVM exit
            Runtime.getRuntime().addShutdownHook(new Thread(this::cleanupAll));
        } catch (IOException e) {
            throw new IllegalStateException("Failed to create temporary directory", e);
        }
    }
    
    /**
     * Create a temporary file with given prefix and extension.
     * 
     * @param prefix file name prefix
     * @param extension file extension (e.g., ".mp3", ".srt")
     * @return Path to created temporary file
     */
    public Path createTempFile(String prefix, String extension) {
        try {
            String fileName = prefix + "-" + UUID.randomUUID() + extension;
            Path filePath = baseDirectory.resolve(fileName);
            Files.createFile(filePath);
            logger.debug("Created temporary file: {}", filePath);
            return filePath;
        } catch (IOException e) {
            throw new RuntimeException("Failed to create temporary file", e);
        }
    }
    
    /**
     * Create a temporary directory for a meditation generation session.
     * 
     * @param sessionId unique session identifier
     * @return Path to created temporary directory
     */
    public Path createSessionDirectory(UUID sessionId) {
        try {
            Path sessionDir = baseDirectory.resolve("session-" + sessionId);
            Files.createDirectories(sessionDir);
            logger.debug("Created session directory: {}", sessionDir);
            return sessionDir;
        } catch (IOException e) {
            throw new RuntimeException("Failed to create session directory", e);
        }
    }
    
    /**
     * Copy content from source path to a new temporary file.
     * 
     * @param sourcePath source file to copy
     * @param prefix target file prefix
     * @param extension target file extension
     * @return Path to new temporary file with copied content
     */
    public Path copyToTempFile(Path sourcePath, String prefix, String extension) {
        try {
            Path tempFile = createTempFile(prefix, extension);
            Files.copy(sourcePath, tempFile, StandardCopyOption.REPLACE_EXISTING);
            logger.debug("Copied {} to temporary file: {}", sourcePath, tempFile);
            return tempFile;
        } catch (IOException e) {
            throw new RuntimeException("Failed to copy to temporary file", e);
        }
    }
    
    /**
     * Delete a specific temporary file.
     * 
     * @param filePath file to delete
     */
    public void deleteTempFile(Path filePath) {
        try {
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.debug("Deleted temporary file: {}", filePath);
            }
        } catch (IOException e) {
            logger.warn("Failed to delete temporary file: {}", filePath, e);
        }
    }
    
    /**
     * Delete all files in a session directory.
     * 
     * @param sessionId session identifier
     */
    public void cleanupSession(UUID sessionId) {
        Path sessionDir = baseDirectory.resolve("session-" + sessionId);
        deleteDirectoryRecursively(sessionDir);
    }
    
    /**
     * Cleanup all temporary files and directories.
     * Called on shutdown hook.
     */
    public void cleanupAll() {
        logger.info("Cleaning up all temporary files in: {}", baseDirectory);
        deleteDirectoryRecursively(baseDirectory);
    }
    
    private void deleteDirectoryRecursively(Path directory) {
        if (!Files.exists(directory)) {
            return;
        }
        
        try  {
            Files.walk(directory)
                .sorted((a, b) -> b.compareTo(a)) // Delete files before directories
                .forEach(path -> {
                    try {
                        Files.deleteIfExists(path);
                    } catch (IOException e) {
                        logger.warn("Failed to delete: {}", path, e);
                    }
                });
        } catch (IOException e) {
            logger.error("Failed to walk directory tree: {}", directory, e);
        }
    }
    
    /**
     * Get the base temporary directory path.
     * 
     * @return base directory path
     */
    public Path getBaseDirectory() {
        return baseDirectory;
    }
}
