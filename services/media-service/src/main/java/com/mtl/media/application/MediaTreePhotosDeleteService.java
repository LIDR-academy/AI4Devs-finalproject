package com.mtl.media.application;

import com.mtl.media.domain.Fotografia;
import com.mtl.media.exception.MediaStorageException;
import com.mtl.media.infrastructure.client.catalog.CatalogMediaPermissionClient;
import com.mtl.media.infrastructure.persistence.jpa.repository.FotografiaRepository;
import com.mtl.media.infrastructure.storage.ObjectStorageRemover;
import java.util.List;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MediaTreePhotosDeleteService {

  private final FotografiaRepository fotografiaRepository;
  private final CatalogMediaPermissionClient catalogMediaPermissionClient;
  private final ObjectStorageRemover objectStorageRemover;

  public MediaTreePhotosDeleteService(
      FotografiaRepository fotografiaRepository,
      CatalogMediaPermissionClient catalogMediaPermissionClient,
      ObjectStorageRemover objectStorageRemover) {
    this.fotografiaRepository = fotografiaRepository;
    this.catalogMediaPermissionClient = catalogMediaPermissionClient;
    this.objectStorageRemover = objectStorageRemover;
  }

  /**
   * Elimina todas las fotografías del árbol (metadatos y objetos en bucket). Requiere permiso de
   * colaborador/admin sobre el árbol (misma política que subida, HU-006).
   */
  @Transactional
  public void deleteAllPhotosForTree(long treeId, Jwt jwt) {
    catalogMediaPermissionClient.resolveActorUsuarioAppIdForTree(treeId, jwt);

    List<Fotografia> photos = fotografiaRepository.findAllByArbolId(treeId);
    if (photos.isEmpty()) {
      return;
    }

    for (Fotografia photo : photos) {
      deleteObjectQuietly(photo.getBucketAlmacenamiento(), photo.getClaveObjeto());
    }
    fotografiaRepository.deleteAll(photos);
  }

  private void deleteObjectQuietly(String bucket, String objectKey) {
    try {
      objectStorageRemover.removeObject(bucket, objectKey);
    } catch (IllegalStateException ex) {
      throw new MediaStorageException(
          "No se pudieron eliminar las fotografías del árbol en el almacén de objetos.", ex);
    }
  }
}
