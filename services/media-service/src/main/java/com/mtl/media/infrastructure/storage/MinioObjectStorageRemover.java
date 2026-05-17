package com.mtl.media.infrastructure.storage;

import io.minio.MinioClient;
import io.minio.RemoveObjectArgs;
import io.minio.errors.ErrorResponseException;

/**
 * Borrado de objetos en MinIO. Usa el mismo {@link MinioClient} que las URLs prefirmadas.
 */
public class MinioObjectStorageRemover implements ObjectStorageRemover {

  private final MinioClient minioClient;

  public MinioObjectStorageRemover(MinioClient minioClient) {
    this.minioClient = minioClient;
  }

  @Override
  public void removeObject(String bucket, String objectKey) {
    try {
      minioClient.removeObject(
          RemoveObjectArgs.builder().bucket(bucket).object(objectKey).build());
    } catch (ErrorResponseException ex) {
      if ("NoSuchKey".equals(ex.errorResponse().code())) {
        return;
      }
      throw new IllegalStateException(
          "No se pudo eliminar el objeto en MinIO: " + bucket + "/" + objectKey, ex);
    } catch (Exception ex) {
      throw new IllegalStateException(
          "No se pudo eliminar el objeto en MinIO: " + bucket + "/" + objectKey, ex);
    }
  }
}
