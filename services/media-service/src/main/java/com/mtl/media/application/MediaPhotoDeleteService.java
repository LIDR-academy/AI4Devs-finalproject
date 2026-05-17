package com.mtl.media.application;

import com.mtl.media.domain.Fotografia;
import com.mtl.media.exception.MediaStorageException;
import com.mtl.media.infrastructure.client.catalog.CatalogMediaPermissionClient;
import com.mtl.media.infrastructure.persistence.jpa.repository.FotografiaRepository;
import com.mtl.media.infrastructure.storage.ObjectStorageRemover;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MediaPhotoDeleteService {

  private final FotografiaRepository fotografiaRepository;
  private final CatalogMediaPermissionClient catalogMediaPermissionClient;
  private final ObjectStorageRemover objectStorageRemover;

  public MediaPhotoDeleteService(
      FotografiaRepository fotografiaRepository,
      CatalogMediaPermissionClient catalogMediaPermissionClient,
      ObjectStorageRemover objectStorageRemover) {
    this.fotografiaRepository = fotografiaRepository;
    this.catalogMediaPermissionClient = catalogMediaPermissionClient;
    this.objectStorageRemover = objectStorageRemover;
  }

  /**
   * Elimina una fotografía (metadatos y objeto). Si era la principal y quedan otras, promueve la
   * primera restante según orden (TASK-HU-006-14).
   */
  @Transactional
  public void deletePhoto(long photoId, Jwt jwt) {
    Fotografia photo =
        fotografiaRepository
            .findActiveById(photoId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fotografía no encontrada."));

    catalogMediaPermissionClient.resolveActorUsuarioAppIdForTree(photo.getArbolId(), jwt);

    long arbolId = photo.getArbolId();
    deleteObjectQuietly(photo.getBucketAlmacenamiento(), photo.getClaveObjeto());
    fotografiaRepository.delete(photo);
    ensurePrincipalAfterDeletion(arbolId);
  }

  private void ensurePrincipalAfterDeletion(long arbolId) {
    List<Fotografia> remaining = fotografiaRepository.findActiveForTreeOrdered(arbolId);
    if (remaining.isEmpty()) {
      return;
    }
    if (remaining.stream().anyMatch(Fotografia::isEsPrincipal)) {
      return;
    }
    for (int i = 0; i < remaining.size(); i++) {
      remaining.get(i).setEsPrincipal(i == 0);
    }
    fotografiaRepository.saveAll(remaining);
  }

  private void deleteObjectQuietly(String bucket, String objectKey) {
    try {
      objectStorageRemover.removeObject(bucket, objectKey);
    } catch (IllegalStateException ex) {
      throw new MediaStorageException(
          "No se pudo eliminar la fotografía en el almacén de objetos.", ex);
    }
  }
}
