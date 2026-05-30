package com.mtl.media.application;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.mtl.media.domain.Fotografia;
import com.mtl.media.exception.MediaStorageException;
import com.mtl.media.infrastructure.client.catalog.CatalogMediaPermissionClient;
import com.mtl.media.infrastructure.persistence.jpa.repository.FotografiaRepository;
import com.mtl.media.infrastructure.storage.ObjectStorageRemover;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class MediaEjemplarPhotosDeleteServiceTest {

  @Mock private FotografiaRepository fotografiaRepository;
  @Mock private CatalogMediaPermissionClient catalogMediaPermissionClient;
  @Mock private ObjectStorageRemover objectStorageRemover;

  @InjectMocks private MediaEjemplarPhotosDeleteService service;

  @Test
  void deleteAllPhotosForEjemplar_noPhotos_skipsStorageAndRepositoryDelete() {
    Jwt jwt = Jwt.withTokenValue("t").header("alg", "none").subject("sub").build();
    when(catalogMediaPermissionClient.resolveActorUsuarioAppIdForEjemplar(5L, jwt)).thenReturn(42L);
    when(fotografiaRepository.findAllByEjemplarId(5L)).thenReturn(List.of());

    service.deleteAllPhotosForEjemplar(5L, jwt);

    verify(catalogMediaPermissionClient).resolveActorUsuarioAppIdForEjemplar(5L, jwt);
    verifyNoInteractions(objectStorageRemover);
  }

  @Test
  void deleteAllPhotosForEjemplar_removesObjectsThenMetadata() {
    Jwt jwt = Jwt.withTokenValue("t").header("alg", "none").subject("sub").build();
    when(catalogMediaPermissionClient.resolveActorUsuarioAppIdForEjemplar(5L, jwt)).thenReturn(42L);
    Fotografia photo = new Fotografia();
    photo.setFotografiaId(1L);
    photo.setBucketAlmacenamiento("mtl-photos");
    photo.setClaveObjeto("trees/5/a.jpg");
    when(fotografiaRepository.findAllByEjemplarId(5L)).thenReturn(List.of(photo));

    service.deleteAllPhotosForEjemplar(5L, jwt);

    verify(objectStorageRemover).removeObject("mtl-photos", "trees/5/a.jpg");
    verify(fotografiaRepository).deleteAll(List.of(photo));
  }

  @Test
  void deleteAllPhotosForEjemplar_storageFailure_abortsBeforeMetadataDelete() {
    Jwt jwt = Jwt.withTokenValue("t").header("alg", "none").subject("sub").build();
    when(catalogMediaPermissionClient.resolveActorUsuarioAppIdForEjemplar(5L, jwt)).thenReturn(42L);
    Fotografia photo = new Fotografia();
    photo.setBucketAlmacenamiento("mtl-photos");
    photo.setClaveObjeto("trees/5/a.jpg");
    when(fotografiaRepository.findAllByEjemplarId(5L)).thenReturn(List.of(photo));
    org.mockito.Mockito.doThrow(new IllegalStateException("minio down"))
        .when(objectStorageRemover)
        .removeObject(eq("mtl-photos"), eq("trees/5/a.jpg"));

    assertThatThrownBy(() -> service.deleteAllPhotosForEjemplar(5L, jwt))
        .isInstanceOf(MediaStorageException.class);

    verify(fotografiaRepository).findAllByEjemplarId(5L);
    org.mockito.Mockito.verify(fotografiaRepository, org.mockito.Mockito.never()).deleteAll(org.mockito.ArgumentMatchers.any());
  }
}
