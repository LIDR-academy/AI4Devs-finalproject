package com.mtl.media.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.media.domain.Fotografia;
import com.mtl.media.exception.MediaStorageException;
import com.mtl.media.infrastructure.client.catalog.CatalogMediaPermissionClient;
import com.mtl.media.infrastructure.persistence.jpa.repository.FotografiaRepository;
import com.mtl.media.infrastructure.storage.ObjectStorageRemover;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class MediaPhotoDeleteServiceTest {

  @Mock private FotografiaRepository fotografiaRepository;
  @Mock private CatalogMediaPermissionClient catalogMediaPermissionClient;
  @Mock private ObjectStorageRemover objectStorageRemover;

  @InjectMocks private MediaPhotoDeleteService service;

  @Test
  void deletePhoto_notFound_returns404() {
    Jwt jwt = Jwt.withTokenValue("t").header("alg", "none").subject("sub").build();
    when(fotografiaRepository.findActiveById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.deletePhoto(99L, jwt))
        .isInstanceOf(ResponseStatusException.class)
        .satisfies(
            ex ->
                assertThat(((ResponseStatusException) ex).getStatusCode().value()).isEqualTo(404));
  }

  @Test
  void deletePhoto_removesObjectAndMetadata() {
    Jwt jwt = Jwt.withTokenValue("t").header("alg", "none").subject("sub").build();
    Fotografia photo = activePhoto(10L, 5L, false);
    when(fotografiaRepository.findActiveById(10L)).thenReturn(Optional.of(photo));
    when(catalogMediaPermissionClient.resolveActorUsuarioAppIdForEjemplar(5L, jwt)).thenReturn(7L);
    when(fotografiaRepository.findActiveForEjemplarOrdered(5L)).thenReturn(List.of());

    service.deletePhoto(10L, jwt);

    verify(objectStorageRemover).removeObject("mtl-photos", "ejemplares/5/a.jpg");
    verify(fotografiaRepository).delete(photo);
    verify(fotografiaRepository, never()).saveAll(any());
  }

  @Test
  void deletePhoto_whenPrincipalDeleted_promotesNextRemaining() {
    Jwt jwt = Jwt.withTokenValue("t").header("alg", "none").subject("sub").build();
    Fotografia principal = activePhoto(10L, 5L, true);
    when(fotografiaRepository.findActiveById(10L)).thenReturn(Optional.of(principal));
    when(catalogMediaPermissionClient.resolveActorUsuarioAppIdForEjemplar(5L, jwt)).thenReturn(7L);

    Fotografia remaining = activePhoto(11L, 5L, false);
    when(fotografiaRepository.findActiveForEjemplarOrdered(5L)).thenReturn(List.of(remaining));

    service.deletePhoto(10L, jwt);

    ArgumentCaptor<List<Fotografia>> captor = ArgumentCaptor.forClass(List.class);
    verify(fotografiaRepository).saveAll(captor.capture());
    assertThat(captor.getValue()).hasSize(1);
    assertThat(captor.getValue().get(0).isEsPrincipal()).isTrue();
  }

  @Test
  void deletePhoto_storageFailure_abortsBeforeMetadataDelete() {
    Jwt jwt = Jwt.withTokenValue("t").header("alg", "none").subject("sub").build();
    Fotografia photo = activePhoto(10L, 5L, false);
    when(fotografiaRepository.findActiveById(10L)).thenReturn(Optional.of(photo));
    when(catalogMediaPermissionClient.resolveActorUsuarioAppIdForEjemplar(5L, jwt)).thenReturn(7L);
    org.mockito.Mockito.doThrow(new IllegalStateException("minio down"))
        .when(objectStorageRemover)
        .removeObject(eq("mtl-photos"), eq("ejemplares/5/a.jpg"));

    assertThatThrownBy(() -> service.deletePhoto(10L, jwt)).isInstanceOf(MediaStorageException.class);

    verify(fotografiaRepository, never()).delete(any());
  }

  private static Fotografia activePhoto(long id, long ejemplarId, boolean principal) {
    Fotografia photo = new Fotografia();
    photo.setFotografiaId(id);
    photo.setEjemplarId(ejemplarId);
    photo.setBucketAlmacenamiento("mtl-photos");
    photo.setClaveObjeto("ejemplares/5/a.jpg");
    photo.setEsPrincipal(principal);
    return photo;
  }
}
