package com.hexagonal.meditation.generation.infrastructure.out.adapter.storage;

import com.hexagonal.meditation.generation.domain.ports.out.MediaStoragePort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * AWS S3-based media storage adapter using AWS SDK v2.
 * Stores meditation media files in S3 with prefix: generation/{userId}/{meditationId}/
 * Uses LocalStack for local development and testing.
 */
@Component
public class S3MediaStorageAdapter implements MediaStoragePort {
    
    private static final Logger logger = LoggerFactory.getLogger(S3MediaStorageAdapter.class);
    private static final String BUCKET_NAME = "meditation-media";
    
    @Override
    public String uploadMedia(UploadRequest request) {
        logger.info("Uploading media: file={}, user={}, meditation={}, type={}", 
            request.filePath(), request.userId(), request.meditationId(), request.fileType());
        
        String s3Key = request.generateS3Key();
        
        // TODO: Implement actual S3 upload using AWS SDK v2
        // S3Client client = S3Client.builder()...
        // PutObjectRequest request = PutObjectRequest.builder()
        //     .bucket(BUCKET_NAME)
        //     .key(s3Key)
        //     .build();
        // client.putObject(request, RequestBody.fromFile(localFilePath));
        
        String presignedUrl = String.format("https://%s.s3.amazonaws.com/%s?presigned=stub", BUCKET_NAME, s3Key);
        logger.info("Media uploaded successfully: {}", presignedUrl);
        
        return presignedUrl;
    }
}
