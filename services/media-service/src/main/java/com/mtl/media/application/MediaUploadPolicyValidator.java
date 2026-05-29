package com.mtl.media.application;

import com.mtl.media.config.MediaUploadProperties;
import com.mtl.media.exception.MediaUploadValidationException;
import org.springframework.stereotype.Component;

@Component
public class MediaUploadPolicyValidator {

  private final MediaUploadProperties properties;

  public MediaUploadPolicyValidator(MediaUploadProperties properties) {
    this.properties = properties;
  }

  public void validateMimeType(String mimeType) {
    if (mimeType == null || mimeType.isBlank()) {
      throw new MediaUploadValidationException("El tipo MIME es obligatorio.");
    }
    if (!properties.getAllowedMimeTypes().contains(mimeType)) {
      throw new MediaUploadValidationException(
          "Tipo MIME no permitido: " + mimeType + ". Permitidos: " + properties.getAllowedMimeTypes());
    }
  }

  public void validateFileSize(long sizeBytes) {
    if (sizeBytes <= 0) {
      throw new MediaUploadValidationException("El tamaño del archivo debe ser mayor que cero.");
    }
    long max = properties.getMaxFileSize().toBytes();
    if (sizeBytes > max) {
      throw new MediaUploadValidationException(
          "El tamaño del archivo excede el máximo permitido de " + max + " bytes.");
    }
  }

  public void validateMaxPhotosPerEjemplar(int currentPhotosCount, int photosToAddCount) {
    if (photosToAddCount <= 0) {
      throw new MediaUploadValidationException("Debe añadirse al menos una fotografía.");
    }
    if (currentPhotosCount < 0) {
      throw new MediaUploadValidationException("El número actual de fotografías no puede ser negativo.");
    }
    int total = currentPhotosCount + photosToAddCount;
    if (total > properties.getMaxPhotosPerEjemplar()) {
      throw new MediaUploadValidationException(
          "El ejemplar supera el máximo de "
              + properties.getMaxPhotosPerEjemplar()
              + " fotografías permitidas.");
    }
  }
}
