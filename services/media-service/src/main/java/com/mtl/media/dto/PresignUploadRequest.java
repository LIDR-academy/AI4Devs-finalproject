package com.mtl.media.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PresignUploadRequest(
    @NotNull Long treeId,
    @NotBlank String originalFileName,
    @NotBlank String mimeType,
    @Min(1) long sizeBytes) {}
