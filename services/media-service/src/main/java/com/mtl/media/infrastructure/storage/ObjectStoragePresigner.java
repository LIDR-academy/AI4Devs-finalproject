package com.mtl.media.infrastructure.storage;

import java.time.Duration;

/** Genera URLs prefirmadas de subida (PUT) hacia el almacén S3-compatible (p. ej. MinIO). */
public interface ObjectStoragePresigner {

  String presignedPutUrl(String bucket, String objectKey, Duration ttl);

  String presignedGetUrl(String bucket, String objectKey, Duration ttl);
}
