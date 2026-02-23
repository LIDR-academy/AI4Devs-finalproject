package com.hexagonal.meditation.generation.infrastructure.in.rest.dto;

/**
 * Response DTO for file upload endpoint.
 * Returns the presigned URL of the uploaded file.
 */
public record UploadFileResponse(
    String fileUrl,
    String fileType,
    long fileSizeBytes
) {
}
