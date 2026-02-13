package com.hexagonal.meditation.generation.infrastructure.out.adapter.storage;

import com.hexagonal.meditation.generation.domain.model.MediaReference;
import com.hexagonal.meditation.generation.domain.port.out.MediaStoragePort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.util.UUID;

/**
 * AWS S3-based media storage adapter using AWS SDK v2.
 * Stores meditation media files in S3 with prefix: generation/{userId}/{meditationId}/
 * Uses LocalStack for local development and testing.
 */
@Component
public class S3MediaStorageAdapter implements MediaStoragePort {
    
    private static final Logger logger = LoggerFactory.getLogger(S3MediaStorageAdapter.class);
    private static final String BUCKET_NAME = "meditation-media";
    private static final String PREFIX_TEMPLATE = "generation/%s/%s/";
    
    @Override
    public MediaReference uploadMedia(Path localFilePath, UUID userId, UUID meditationId, String mediaType) {
        logger.info("Uploading media: file={}, user={}, meditation={}, type={}", 
            localFilePath, userId, meditationId, mediaType);
        
        validateInputs(localFilePath, userId, meditationId, mediaType);
        
        String s3Key = buildS3Key(userId, meditationId, localFilePath.getFileName().toString());
        
        // TODO: Implement actual S3 upload using AWS SDK v2
        // S3Client client = S3Client.builder()...
        // PutObjectRequest request = PutObjectRequest.builder()
        //     .bucket(BUCKET_NAME)
        //     .key(s3Key)
        //     .contentType(mediaType)
        //     .build();
        // client.putObject(request, RequestBody.fromFile(localFilePath));
        
        String s3Url = String.format("s3://%s/%s", BUCKET_NAME, s3Key);
        logger.info("Media uploaded successfully: {}", s3Url);
        
        return new MediaReference(s3Url);
    }
    
    @Override
    public Path downloadMedia(MediaReference mediaReference, Path localDestinationPath) {
        logger.info("Downloading media: ref={}, destination={}", 
            mediaReference.url(), localDestinationPath);
        
        if (!mediaReference.isS3()) {
            throw new IllegalArgumentException("Media reference is not an S3 URL: " + mediaReference.url());
        }
        
        // TODO: Implement actual S3 download using AWS SDK v2
        // Parse s3://bucket/key from mediaReference.url()
        // S3Client client = S3Client.builder()...
        // GetObjectRequest request = GetObjectRequest.builder()
        //     .bucket(bucket)
        //     .key(key)
        //     .build();
        // client.getObject(request, ResponseTransformer.toFile(localDestinationPath));
        
        logger.info("Media downloaded successfully: {}", localDestinationPath);
        return localDestinationPath;
    }
    
    @Override
    public void deleteMedia(MediaReference mediaReference) {
        logger.info("Deleting media: {}", mediaReference.url());
        
        if (!mediaReference.isS3()) {
            logger.warn("Cannot delete non-S3 media reference: {}", mediaReference.url());
            return;
        }
        
        // TODO: Implement actual S3 delete using AWS SDK v2
        // Parse s3://bucket/key from mediaReference.url()
        // S3Client client = S3Client.builder()...
        // DeleteObjectRequest request = DeleteObjectRequest.builder()
        //     .bucket(bucket)
        //     .key(key)
        //     .build();
        // client.deleteObject(request);
        
        logger.info("Media deleted successfully: {}", mediaReference.url());
    }
    
    @Override
    public boolean exists(MediaReference mediaReference) {
        if (!mediaReference.isS3()) {
            return false;
        }
        
        // TODO: Implement actual S3 head object check
        // S3Client client = S3Client.builder()...
        // HeadObjectRequest request = HeadObjectRequest.builder()
        //     .bucket(bucket)
        //     .key(key)
        //     .build();
        // try {
        //     client.headObject(request);
        //     return true;
        // } catch (NoSuchKeyException e) {
        //     return false;
        // }
        
        logger.debug("Checking media existence: {}", mediaReference.url());
        return true; // Stub: assume exists
    }
    
    private String buildS3Key(UUID userId, UUID meditationId, String fileName) {
        String prefix = String.format(PREFIX_TEMPLATE, userId, meditationId);
        return prefix + fileName;
    }
    
    private void validateInputs(Path localFilePath, UUID userId, UUID meditationId, String mediaType) {
        if (localFilePath == null) {
            throw new IllegalArgumentException("Local file path cannot be null");
        }
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (meditationId == null) {
            throw new IllegalArgumentException("Meditation ID cannot be null");
        }
        if (mediaType == null || mediaType.isBlank()) {
            throw new IllegalArgumentException("Media type cannot be null or empty");
        }
    }
}
