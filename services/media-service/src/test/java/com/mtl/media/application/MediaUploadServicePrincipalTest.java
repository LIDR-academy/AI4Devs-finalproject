package com.mtl.media.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.media.config.MediaPresignProperties;
import com.mtl.media.config.MediaStorageProperties;
import com.mtl.media.domain.CategoriaFotografia;
import com.mtl.media.domain.Fotografia;
import com.mtl.media.dto.ConfirmPhotoUploadRequest;
import com.mtl.media.dto.PhotoMetadataResponse;
import com.mtl.media.exception.MediaUploadValidationException;
import com.mtl.media.infrastructure.client.catalog.CatalogMediaPermissionClient;
import com.mtl.media.infrastructure.persistence.jpa.repository.FotografiaRepository;
import com.mtl.media.infrastructure.storage.ObjectStoragePresigner;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class MediaUploadServicePrincipalTest {

  @Mock private FotografiaRepository fotografiaRepository;
  @Mock private MediaUploadPolicyValidator uploadPolicyValidator;
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
          .issuedAt(java.time.Instant.now())
          .expiresAt(java.time.Instant.now().plusSeconds(3600))
          .build();

  @BeforeEach
  void setUp() {
    when(storageProperties.getBucket()).thenReturn("mtl-photos");
    when(catalogMediaPermissionClient.resolveActorUsuarioAppIdForEjemplar(anyLong(), any()))
        .thenReturn(200L);
    service =
        new MediaUploadService(
            fotografiaRepository,
            uploadPolicyValidator,
            storageProperties,
            presignProperties,
            catalogMediaPermissionClient,
            objectStoragePresigner);
    doNothing().when(uploadPolicyValidator).validateMimeType(any());
    doNothing().when(uploadPolicyValidator).validateFileSize(anyLong());
    doNothing().when(uploadPolicyValidator).validateMaxPhotosPerEjemplar(anyInt(), anyInt());
  }

  @Test
  void confirmUpload_firstPhoto_isAlwaysPrincipal() {
    when(fotografiaRepository.countActiveForEjemplar(1L)).thenReturn(0);
    when(fotografiaRepository.save(any(Fotografia.class)))
        .thenAnswer(
            inv -> {
              Fotografia f = inv.getArgument(0);
              f.setFotografiaId(100L);
              return f;
            });

    ConfirmPhotoUploadRequest req =
        new ConfirmPhotoUploadRequest(
            1L,
            "mtl-photos",
            "trees/1/a.jpg",
            "a.jpg",
            "image/jpeg",
            1024L,
            null,
            null,
            null,
            false,
            null);

    PhotoMetadataResponse res = service.confirmUpload(req, TEST_JWT);
    assertThat(res.isPrimary()).isTrue();
    assertThat(res.order()).isZero();

    ArgumentCaptor<Fotografia> cap = ArgumentCaptor.forClass(Fotografia.class);
    verify(fotografiaRepository).save(cap.capture());
    assertThat(cap.getValue().isEsPrincipal()).isTrue();
    assertThat(cap.getValue().getOrden()).isZero();
    assertThat(cap.getValue().getSubidaPor()).isEqualTo(200L);
    assertThat(cap.getValue().getCategoria()).isEqualTo(CategoriaFotografia.PUBLIC);
  }

  @Test
  void confirmUpload_secondPhoto_isNotPrincipal() {
    when(fotografiaRepository.countActiveForEjemplar(1L)).thenReturn(1);
    when(fotografiaRepository.save(any(Fotografia.class)))
        .thenAnswer(
            inv -> {
              Fotografia f = inv.getArgument(0);
              f.setFotografiaId(101L);
              return f;
            });

    ConfirmPhotoUploadRequest req =
        new ConfirmPhotoUploadRequest(
            1L,
            "mtl-photos",
            "trees/1/b.jpg",
            "b.jpg",
            "image/jpeg",
            2048L,
            null,
            null,
            null,
            false,
            null);

    PhotoMetadataResponse res = service.confirmUpload(req, TEST_JWT);
    assertThat(res.isPrimary()).isFalse();
    assertThat(res.order()).isEqualTo(1);

    ArgumentCaptor<Fotografia> cap = ArgumentCaptor.forClass(Fotografia.class);
    verify(fotografiaRepository).save(cap.capture());
    assertThat(cap.getValue().isEsPrincipal()).isFalse();
    assertThat(cap.getValue().getOrden()).isEqualTo(1);
    assertThat(cap.getValue().getCategoria()).isEqualTo(CategoriaFotografia.PUBLIC);
  }

  @Test
  void confirmUpload_secondPhoto_withPrincipalFlag_rejected() {
    when(fotografiaRepository.countActiveForEjemplar(1L)).thenReturn(1);

    ConfirmPhotoUploadRequest req =
        new ConfirmPhotoUploadRequest(
            1L,
            "mtl-photos",
            "trees/1/b.jpg",
            "b.jpg",
            "image/jpeg",
            2048L,
            null,
            null,
            null,
            true,
            null);

    assertThrows(MediaUploadValidationException.class, () -> service.confirmUpload(req, TEST_JWT));
  }

  @Test
  void confirmUpload_explicitOrden_mustMatchNextIndex() {
    when(fotografiaRepository.countActiveForEjemplar(1L)).thenReturn(2);

    ConfirmPhotoUploadRequest req =
        new ConfirmPhotoUploadRequest(
            1L,
            "mtl-photos",
            "trees/1/c.jpg",
            "c.jpg",
            "image/jpeg",
            512L,
            null,
            null,
            5,
            false,
            null);

    assertThrows(MediaUploadValidationException.class, () -> service.confirmUpload(req, TEST_JWT));
  }

  @Test
  void confirmUpload_wrongBucket_rejected() {
    ConfirmPhotoUploadRequest req =
        new ConfirmPhotoUploadRequest(
            1L,
            "otro-bucket",
            "trees/1/a.jpg",
            "a.jpg",
            "image/jpeg",
            1024L,
            null,
            null,
            null,
            true,
            null);

    assertThrows(MediaUploadValidationException.class, () -> service.confirmUpload(req, TEST_JWT));
  }
}
