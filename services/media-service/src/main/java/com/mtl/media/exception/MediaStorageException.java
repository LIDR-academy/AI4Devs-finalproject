package com.mtl.media.exception;

/** Fallo al interactuar con el almacén de objetos (MinIO/S3). */
public class MediaStorageException extends RuntimeException {

  public MediaStorageException(String message, Throwable cause) {
    super(message, cause);
  }
}
