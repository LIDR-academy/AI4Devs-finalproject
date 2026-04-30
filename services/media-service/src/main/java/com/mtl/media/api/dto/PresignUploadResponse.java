package com.mtl.media.api.dto;

import java.time.OffsetDateTime;

public record PresignUploadResponse(
    String uploadUrl, String bucket, String objectKey, OffsetDateTime expiresAt) {}
