package com.hexagonal.meditation.generation.domain.ports.out;

import java.nio.file.Path;
import java.util.UUID;

/**
 * Output port for media storage (S3).
 * Driven port for uploading generated media files to cloud storage.
 * 
 * Hexagonal Architecture - Driven Port (Domain → Infrastructure)
 * BC: Generation
 * 
 * Implementation: S3MediaStorageAdapter (AWS SDK v2)
 * MVP: LocalStack (local) / AWS S3 (production)
 */
public interface MediaStoragePort {

    /**
     * Upload media file to storage with BC-specific prefix.
     * 
     * @param request upload request with file and metadata
     * @return presigned URL for accessing the uploaded file
     * @throws RuntimeException if upload fails or storage is unavailable
     */
    String uploadMedia(UploadRequest request);

    /**
     * Upload request (domain object).
     */
    record UploadRequest(
        Path filePath,
        String userId,
        UUID meditationId,
        MediaFileType fileType,
        long ttlSeconds
    ) {
        public UploadRequest {
            if (filePath == null) {
                throw new IllegalArgumentException("File path cannot be null");
            }
            if (userId == null || userId.isBlank()) {
                throw new IllegalArgumentException("User ID cannot be null or blank");
            }
            if (meditationId == null) {
                throw new IllegalArgumentException("Meditation ID cannot be null");
            }
            if (fileType == null) {
                throw new IllegalArgumentException("File type cannot be null");
            }
            if (ttlSeconds <= 0) {
                throw new IllegalArgumentException("TTL must be positive");
            }
        }

        /**
         * Generate S3 key with BC prefix.
         * Format: generation/{userId}/{meditationId}/{filename}
         */
        public String generateS3Key() {
            String filename = fileType.getFilename();
            return String.format("generation/%s/%s/%s", userId, meditationId, filename);
        }
    }

    /**
     * Media file types with standard filenames.
     */
    enum MediaFileType {
        VIDEO("video.mp4", "video/mp4"),
        AUDIO("audio.mp3", "audio/mpeg"),
        SUBTITLE("subs.srt", "text/srt");

        private final String filename;
        private final String contentType;

        MediaFileType(String filename, String contentType) {
            this.filename = filename;
            this.contentType = contentType;
        }

        public String getFilename() {
            return filename;
        }

        public String getContentType() {
            return contentType;
        }
    }
}
