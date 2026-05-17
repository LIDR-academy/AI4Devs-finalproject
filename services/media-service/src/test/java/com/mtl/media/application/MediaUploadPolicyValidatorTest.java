package com.mtl.media.application;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.mtl.media.config.MediaUploadProperties;
import com.mtl.media.exception.MediaUploadValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.util.unit.DataSize;

class MediaUploadPolicyValidatorTest {

  private MediaUploadPolicyValidator validator;

  @BeforeEach
  void setUp() {
    MediaUploadProperties properties = new MediaUploadProperties();
    properties.setMaxFileSize(DataSize.ofMegabytes(20));
    validator = new MediaUploadPolicyValidator(properties);
  }

  @Test
  void validateMimeType_acceptsConfiguredType() {
    assertDoesNotThrow(() -> validator.validateMimeType("image/jpeg"));
  }

  @Test
  void validateMimeType_acceptsPngAndWebp() {
    assertDoesNotThrow(() -> validator.validateMimeType("image/png"));
    assertDoesNotThrow(() -> validator.validateMimeType("image/webp"));
  }

  @Test
  void validateMimeType_rejectsNullOrBlank() {
    assertThrows(MediaUploadValidationException.class, () -> validator.validateMimeType(null));
    assertThrows(MediaUploadValidationException.class, () -> validator.validateMimeType("   "));
  }

  @Test
  void validateMimeType_rejectsUnsupportedType() {
    assertThrows(MediaUploadValidationException.class, () -> validator.validateMimeType("application/pdf"));
  }

  @Test
  void validateFileSize_acceptsSizeUnderConfiguredLimit() {
    assertDoesNotThrow(() -> validator.validateFileSize(DataSize.ofMegabytes(20).toBytes()));
  }

  @Test
  void validateFileSize_rejectsNonPositiveSize() {
    assertThrows(MediaUploadValidationException.class, () -> validator.validateFileSize(0));
    assertThrows(MediaUploadValidationException.class, () -> validator.validateFileSize(-1));
  }

  @Test
  void validateFileSize_rejectsSizeOverConfiguredLimit() {
    long oversizedFileBytes = DataSize.ofMegabytes(21).toBytes();
    assertThrows(
        MediaUploadValidationException.class, () -> validator.validateFileSize(oversizedFileBytes));
  }

  @Test
  void validateMaxPhotosPerTree_acceptsMaximumAllowedCount() {
    assertDoesNotThrow(() -> validator.validateMaxPhotosPerTree(9, 1));
  }

  @Test
  void validateMaxPhotosPerTree_rejectsCountOverLimit() {
    assertThrows(MediaUploadValidationException.class, () -> validator.validateMaxPhotosPerTree(10, 1));
  }

  @Test
  void validateMaxPhotosPerTree_acceptsExactlyMaxPhotosInOneBatch() {
    assertDoesNotThrow(() -> validator.validateMaxPhotosPerTree(0, 10));
  }

  @Test
  void validateMaxPhotosPerTree_rejectsNonPositivePhotosToAdd() {
    assertThrows(MediaUploadValidationException.class, () -> validator.validateMaxPhotosPerTree(0, 0));
  }

  @Test
  void validateMaxPhotosPerTree_rejectsNegativeCurrentCount() {
    assertThrows(MediaUploadValidationException.class, () -> validator.validateMaxPhotosPerTree(-1, 1));
  }
}
