package com.mtl.media.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.media.api.dto.PresignUploadRequest;
import com.mtl.media.api.dto.PresignUploadResponse;
import com.mtl.media.config.MediaPresignProperties;
import com.mtl.media.config.MediaStorageProperties;
import com.mtl.media.config.MediaUploadProperties;
import com.mtl.media.domain.FotografiaRepository;
import com.mtl.media.integration.catalog.CatalogMediaPermissionClient;
import com.mtl.media.storage.ObjectStoragePresigner;
import com.mtl.media.validation.MediaUploadPolicyValidator;
import com.mtl.media.validation.MediaUploadValidationException;
import java.time.Duration;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.unit.DataSize;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class MediaUploadServicePresignTest {

  @Mock private FotografiaRepository fotografiaRepository;
  @Mock private MediaStorageProperties storageProperties;
  @Mock private MediaPresignProperties presignProperties;
  @Mock private CatalogMediaPermissionClient catalogMediaPermissionClient;
  @Mock private ObjectStoragePresigner objectStoragePresigner;

  private MediaUploadService service;

  private static final Jwt TEST_JWT =
      Jwt.withTokenValue("test")
          .header("alg", "none")
          .issuer("http://localhost:8180/realms/mtl")
          .subject("sub")
          .issuedAt(Instant.now())
          .expiresAt(Instant.now().plusSeconds(3600))
          .build();

  @BeforeEach
  void setUp() {
    MediaUploadProperties properties = new MediaUploadProperties();
    properties.setMaxFileSize(DataSize.ofMegabytes(20));
    MediaUploadPolicyValidator realValidator = new MediaUploadPolicyValidator(properties);
    when(storageProperties.getBucket()).thenReturn("mtl-photos");
    when(storageProperties.getEndpoint()).thenReturn("http://localhost:9000");
    when(presignProperties.getExpiresIn()).thenReturn(Duration.ofMinutes(15));
    when(catalogMediaPermissionClient.resolveActorUsuarioAppIdForTree(anyLong(), any()))
        .thenReturn(200L);
    when(objectStoragePresigner.presignedPutUrl(eq("mtl-photos"), anyString(), any()))
        .thenReturn("http://localhost:9000/mtl-photos/trees/7/x?X-Amz-Algorithm=AWS4-HMAC-SHA256");
    service =
        new MediaUploadService(
            fotografiaRepository,
            realValidator,
            storageProperties,
            presignProperties,
            catalogMediaPermissionClient,
            objectStoragePresigner);
  }

  @Test
  void createPresignedUpload_whenTreeAlreadyHasMaxPhotos_throws() {
    when(fotografiaRepository.countActiveForTree(7L)).thenReturn(10);

    PresignUploadRequest req = new PresignUploadRequest(7L, "a.jpg", "image/jpeg", 1024L);

    assertThrows(MediaUploadValidationException.class, () -> service.createPresignedUpload(req, TEST_JWT));
  }

  @Test
  void createPresignedUpload_whenNinePhotos_returnsPresignResponse() {
    when(fotografiaRepository.countActiveForTree(7L)).thenReturn(9);

    PresignUploadRequest req = new PresignUploadRequest(7L, "a.jpg", "image/jpeg", 1024L);

    PresignUploadResponse res = service.createPresignedUpload(req, TEST_JWT);
    assertThat(res.uploadUrl()).contains("X-Amz-Algorithm");
    assertThat(res.bucket()).isEqualTo("mtl-photos");
    assertThat(res.objectKey()).startsWith("trees/7/");
    verify(objectStoragePresigner).presignedPutUrl(eq("mtl-photos"), eq(res.objectKey()), any());
    verify(catalogMediaPermissionClient).resolveActorUsuarioAppIdForTree(7L, TEST_JWT);
  }

  @Test
  void createPresignedUpload_rejectsDisallowedMime() {
    when(fotografiaRepository.countActiveForTree(7L)).thenReturn(0);

    PresignUploadRequest req = new PresignUploadRequest(7L, "x.pdf", "application/pdf", 1024L);

    assertThrows(MediaUploadValidationException.class, () -> service.createPresignedUpload(req, TEST_JWT));
  }

  @Test
  void createPresignedUpload_rejectsOversizedFile() {
    when(fotografiaRepository.countActiveForTree(7L)).thenReturn(0);

    long tooLarge = DataSize.ofMegabytes(21).toBytes();
    PresignUploadRequest req = new PresignUploadRequest(7L, "huge.jpg", "image/jpeg", tooLarge);

    assertThrows(MediaUploadValidationException.class, () -> service.createPresignedUpload(req, TEST_JWT));
  }
}
