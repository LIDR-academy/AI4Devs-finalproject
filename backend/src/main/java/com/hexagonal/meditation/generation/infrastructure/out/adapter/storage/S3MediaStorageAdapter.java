package com.hexagonal.meditation.generation.infrastructure.out.adapter.storage;

import com.hexagonal.meditation.generation.domain.ports.out.MediaStoragePort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * AWS S3-based media storage adapter using AWS SDK v2.
 * Stores meditation media files in S3 with prefix: generation/{userId}/{meditationId}/
 * Uses LocalStack for local development and testing.
 */
@Component
public class S3MediaStorageAdapter implements MediaStoragePort {
    
    private static final Logger logger = LoggerFactory.getLogger(S3MediaStorageAdapter.class);
    
    private final S3Client s3Client;
    private final String endpoint;
    private final String bucketName;
    
    public S3MediaStorageAdapter(
            S3Client s3Client,
            @Value("${aws.s3.endpoint:}") String endpoint,
            @Value("${aws.s3.bucket-name:meditation-outputs}") String bucketName) {
        this.s3Client = s3Client;
        this.endpoint = endpoint;
        this.bucketName = bucketName;
    }
    
    @Override
    public String uploadMedia(UploadRequest request) {
        logger.info("Uploading media: file={}, user={}, meditation={}, type={}", 
            request.filePath(), request.userId(), request.meditationId(), request.fileType());
        
        String s3Key = request.generateS3Key();
        Path localFilePath = request.filePath();
        
        try {
            // Get content type from enum
            String contentType = request.fileType().getContentType();
            
            // Upload to S3
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(contentType)
                    .build();
            
            s3Client.putObject(putRequest, RequestBody.fromFile(localFilePath));
            
            // Generate URL (LocalStack path-style or AWS virtual-hosted-style)
            String url = generateUrl(s3Key);
            logger.info("Media uploaded successfully: {}", url);
            
            return url;
            
        } catch (Exception e) {
            logger.error("Failed to upload media to S3", e);
            throw new RuntimeException("Failed to upload media to S3: " + e.getMessage(), e);
        }
    }
    
    private String generateUrl(String s3Key) {
        if (!endpoint.isBlank()) {
            // LocalStack: use path-style URLs
            return String.format("%s/%s/%s", endpoint, bucketName, s3Key);
        } else {
            // AWS: use virtual-hosted-style URLs
            return String.format("https://%s.s3.amazonaws.com/%s", bucketName, s3Key);
        }
    }
}

