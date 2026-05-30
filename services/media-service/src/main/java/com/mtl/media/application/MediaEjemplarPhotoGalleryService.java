package com.mtl.media.application;

import com.mtl.media.domain.Fotografia;
import com.mtl.media.infrastructure.client.catalog.CatalogMediaPermissionClient;
import com.mtl.media.infrastructure.persistence.jpa.repository.FotografiaRepository;
import java.util.List;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MediaEjemplarPhotoGalleryService {

  private final FotografiaRepository fotografiaRepository;
  private final CatalogMediaPermissionClient catalogMediaPermissionClient;

  public MediaEjemplarPhotoGalleryService(
      FotografiaRepository fotografiaRepository,
      CatalogMediaPermissionClient catalogMediaPermissionClient) {
    this.fotografiaRepository = fotografiaRepository;
    this.catalogMediaPermissionClient = catalogMediaPermissionClient;
  }

  /**
   * Galería visible según OpenAPI: anónimo → solo {@code PUBLIC}; con JWT y permiso de negocio sobre
   * el árbol (vía catálogo) → {@code PUBLIC} + {@code PRIVATE}.
   */
  @Transactional(readOnly = true)
  public List<Fotografia> findVisiblePhotos(long ejemplarId, Jwt jwt) {
    if (jwt == null) {
      return fotografiaRepository.findPublicForEjemplarOrdered(ejemplarId);
    }
    if (catalogMediaPermissionClient.hasPhotoManagementPermission(ejemplarId, jwt)) {
      return fotografiaRepository.findActiveForEjemplarOrdered(ejemplarId);
    }
    return fotografiaRepository.findPublicForEjemplarOrdered(ejemplarId);
  }
}
