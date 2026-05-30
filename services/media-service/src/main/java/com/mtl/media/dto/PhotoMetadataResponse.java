package com.mtl.media.dto;

import java.time.OffsetDateTime;

public record PhotoMetadataResponse(
    Long photoId,
    Long treeId,
    String bucket,
    String objectKey,
    String originalFileName,
    String mimeType,
    long sizeBytes,
    Integer widthPx,
    Integer heightPx,
    int order,
    boolean isPrimary,
    OffsetDateTime uploadedAt) {}
