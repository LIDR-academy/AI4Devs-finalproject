package com.hexagonal.meditation.generation.domain.port.out;

import com.hexagonal.meditation.generation.domain.model.MediaReference;

import java.nio.file.Path;
import java.util.UUID;

/**
 * Port for media storage (S3, local filesystem, etc.).
 * Handles upload, download, and deletion of meditation media files.
 */
public interface MediaStoragePort {
    
    /**
     * Upload media file to storage.
     * 
     * @param localFilePath local path of file to upload
     * @param userId user who owns the media
     * @param meditationId meditation this media belongs to
     * @param mediaType MIME type of media (e.g., "video/mp4", "audio/mpeg")
     * @return reference to uploaded media
     */
    MediaReference uploadMedia(Path localFilePath, UUID userId, UUID meditationId, String mediaType);
    
    /**
     * Download media from storage to local filesystem.
     * 
     * @param mediaReference reference to media to download
     * @param localDestinationPath local path where media should be saved
     * @return actual path of downloaded media
     */
    Path downloadMedia(MediaReference mediaReference, Path localDestinationPath);
    
    /**
     * Delete media from storage.
     * 
     * @param mediaReference reference to media to delete
     */
    void deleteMedia(MediaReference mediaReference);
    
    /**
     * Check if media exists in storage.
     * 
     * @param mediaReference reference to media to check
     * @return true if media exists, false otherwise
     */
    boolean exists(MediaReference mediaReference);
}
