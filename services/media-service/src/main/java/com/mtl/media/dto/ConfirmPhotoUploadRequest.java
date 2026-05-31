package com.mtl.media.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ConfirmPhotoUploadRequest(
    @NotNull Long treeId,
    @NotBlank String bucket,
    @NotBlank String objectKey,
    @NotBlank String originalFileName,
    @NotBlank String mimeType,
    @Min(1) long sizeBytes,
    Integer widthPx,
    Integer heightPx,
    Integer order,
    Boolean isPrimary,
    String checksumSha256) {}
