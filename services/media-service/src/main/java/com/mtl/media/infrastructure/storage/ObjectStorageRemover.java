package com.mtl.media.infrastructure.storage;

/** Elimina objetos del almacén S3-compatible (p. ej. MinIO). */
public interface ObjectStorageRemover {

  /**
   * Elimina el objeto indicado. Si no existe, la operación es idempotente (no falla).
   */
  void removeObject(String bucket, String objectKey);
}
