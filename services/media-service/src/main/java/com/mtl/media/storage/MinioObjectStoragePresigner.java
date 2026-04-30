package com.mtl.media.storage;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.http.Method;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Presign PUT con SigV4 vía cliente MinIO. El {@code endpoint} configurado en el bean debe ser
 * alcanzable desde el navegador que ejecutará el PUT (p. ej. {@code http://localhost:9000} en local).
 */
public class MinioObjectStoragePresigner implements ObjectStoragePresigner {

  private final MinioClient minioClient;

  public MinioObjectStoragePresigner(MinioClient minioClient) {
    this.minioClient = minioClient;
  }

  @Override
  public String presignedPutUrl(String bucket, String objectKey, Duration ttl) {
    return presignedUrl(Method.PUT, bucket, objectKey, ttl);
  }

  @Override
  public String presignedGetUrl(String bucket, String objectKey, Duration ttl) {
    return presignedUrl(Method.GET, bucket, objectKey, ttl);
  }

  private String presignedUrl(Method method, String bucket, String objectKey, Duration ttl) {
    long seconds = ttl.toSeconds();
    if (seconds <= 0) {
      seconds = 60;
    }
    int expiry = (int) Math.min(seconds, Integer.MAX_VALUE);
    try {
      return minioClient.getPresignedObjectUrl(
          GetPresignedObjectUrlArgs.builder()
              .method(method)
              .bucket(bucket)
              .object(objectKey)
              .expiry(expiry, TimeUnit.SECONDS)
              .build());
    } catch (Exception e) {
      throw new IllegalStateException("No se pudo generar URL prefirmada en MinIO", e);
    }
  }
}
