package com.mtl.media.application;

import com.mtl.media.domain.Fotografia;
import com.mtl.media.infrastructure.client.catalog.CatalogMediaPermissionClient;
import com.mtl.media.infrastructure.client.catalog.CatalogPublicTreeVisibilityGuard;
import com.mtl.media.infrastructure.persistence.jpa.repository.FotografiaRepository;
import java.util.List;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MediaEjemplarPhotoGalleryService {

  private final FotografiaRepository fotografiaRepository;
  private final CatalogMediaPermissionClient catalogMediaPermissionClient;
  private final CatalogPublicTreeVisibilityGuard catalogPublicTreeVisibilityGuard;

  public MediaEjemplarPhotoGalleryService(
      FotografiaRepository fotografiaRepository,
      CatalogMediaPermissionClient catalogMediaPermissionClient,
      CatalogPublicTreeVisibilityGuard catalogPublicTreeVisibilityGuard) {
    this.fotografiaRepository = fotografiaRepository;
    this.catalogMediaPermissionClient = catalogMediaPermissionClient;
    this.catalogPublicTreeVisibilityGuard = catalogPublicTreeVisibilityGuard;
  }

  /**
   * Galería visible según OpenAPI: anónimo o JWT sin permiso de gestión → solo fotos {@code PUBLIC} y
   * solo si el árbol es visible en catálogo público (misma regla que foto principal). Con JWT y
   * permiso de negocio sobre el árbol (vía catálogo) → {@code PUBLIC} + {@code PRIVATE}.
   */
  @Transactional(readOnly = true)
  public List<Fotografia> findVisiblePhotos(long treeId, Jwt jwt) {
    if (jwt != null && catalogMediaPermissionClient.hasPhotoManagementPermission(treeId, jwt)) {
      return fotografiaRepository.findActiveForEjemplarOrdered(treeId);
    }
    catalogPublicTreeVisibilityGuard.assertVisibleInPublicCatalog(treeId, jwt);
    return fotografiaRepository.findPublicForEjemplarOrdered(treeId);
  }
}
