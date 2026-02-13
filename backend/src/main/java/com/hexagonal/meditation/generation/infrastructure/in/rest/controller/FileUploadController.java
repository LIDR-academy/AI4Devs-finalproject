package com.hexagonal.meditation.generation.infrastructure.in.rest.controller;

import com.hexagonal.meditation.generation.domain.ports.out.MediaStoragePort;
import com.hexagonal.meditation.generation.domain.ports.out.MediaStoragePort.MediaFileType;
import com.hexagonal.meditation.generation.domain.ports.out.MediaStoragePort.UploadRequest;
import com.hexagonal.meditation.generation.infrastructure.in.rest.dto.UploadFileResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

/**
 * REST Controller for file uploads to S3/LocalStack.
 * 
 * Allows uploading images and music files before meditation generation.
 * Files are uploaded to S3 and presigned URLs are returned to the client.
 * 
 * Bounded Context: Generation
 */
@RestController
@RequestMapping("/v1/generation/upload")
public class FileUploadController {
    
    private static final Logger log = LoggerFactory.getLogger(FileUploadController.class);
    
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    private static final long PRESIGNED_URL_TTL_SECONDS = 3600; // 1 hour
    
    private final MediaStoragePort mediaStoragePort;
    
    public FileUploadController(MediaStoragePort mediaStoragePort) {
        this.mediaStoragePort = mediaStoragePort;
    }
    
    /**
     * Upload an image file to S3/LocalStack.
     * 
     * @param file the image file to upload
     * @param userId user ID (from header, in production from JWT)
     * @return presigned URL of the uploaded image
     */
    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadFileResponse> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-User-ID", required = false) UUID userId) {
        
        log.info("Uploading image file: {}, size: {} bytes, userId: {}", 
                file.getOriginalFilename(), file.getSize(), userId);
        
        // Validate user ID
        if (userId == null) {
            userId = UUID.randomUUID(); // Fallback for MVP (no auth)
        }
        
        // Validate file
        validateFile(file, "image");
        
        try {
            // Save to temp file
            Path tempFile = saveTempFile(file);
            
            try {
                // Upload to S3
                String presignedUrl = mediaStoragePort.uploadMedia(new UploadRequest(
                    tempFile,
                    userId.toString(),
                    UUID.randomUUID(), // Temporary ID, will be replaced when meditation is created
                    MediaFileType.IMAGE,
                    PRESIGNED_URL_TTL_SECONDS
                ));
                
                log.info("Image uploaded successfully: {}", presignedUrl);
                
                return ResponseEntity.ok(new UploadFileResponse(
                    presignedUrl,
                    "image",
                    file.getSize()
                ));
                
            } finally {
                // Cleanup temp file
                Files.deleteIfExists(tempFile);
            }
            
        } catch (IOException e) {
            log.error("Failed to upload image: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Upload a music file to S3/LocalStack.
     * 
     * @param file the music file to upload
     * @param userId user ID (from header, in production from JWT)
     * @return presigned URL of the uploaded music
     */
    @PostMapping(value = "/music", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadFileResponse> uploadMusic(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-User-ID", required = false) UUID userId) {
        
        log.info("Uploading music file: {}, size: {} bytes, userId: {}", 
                file.getOriginalFilename(), file.getSize(), userId);
        
        // Validate user ID
        if (userId == null) {
            userId = UUID.randomUUID(); // Fallback for MVP (no auth)
        }
        
        // Validate file
        validateFile(file, "audio");
        
        try {
            // Save to temp file
            Path tempFile = saveTempFile(file);
            
            try {
                // Upload to S3
                String presignedUrl = mediaStoragePort.uploadMedia(new UploadRequest(
                    tempFile,
                    userId.toString(),
                    UUID.randomUUID(), // Temporary ID, will be replaced when meditation is created
                    MediaFileType.AUDIO,
                    PRESIGNED_URL_TTL_SECONDS
                ));
                
                log.info("Music uploaded successfully: {}", presignedUrl);
                
                return ResponseEntity.ok(new UploadFileResponse(
                    presignedUrl,
                    "audio",
                    file.getSize()
                ));
                
            } finally {
                // Cleanup temp file
                Files.deleteIfExists(tempFile);
            }
            
        } catch (IOException e) {
            log.error("Failed to upload music: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Validate uploaded file (size, content type).
     */
    private void validateFile(MultipartFile file, String expectedType) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum allowed: " + MAX_FILE_SIZE + " bytes");
        }
        
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("Content type is missing");
        }
        
        if (expectedType.equals("image") && !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Invalid image file type: " + contentType);
        }
        
        if (expectedType.equals("audio") && !contentType.startsWith("audio/")) {
            throw new IllegalArgumentException("Invalid audio file type: " + contentType);
        }
    }
    
    /**
     * Save multipart file to temporary location.
     */
    private Path saveTempFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        Path tempFile = Files.createTempFile("upload-", extension);
        file.transferTo(tempFile);
        
        return tempFile;
    }
}
