package com.mtl.media.validation;

/** Excepción de validación para reglas de subida de fotografías. */
public class MediaUploadValidationException extends RuntimeException {

  public MediaUploadValidationException(String message) {
    super(message);
  }
}
