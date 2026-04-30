package com.mtl.media.application;

import com.mtl.media.domain.Fotografia;
import com.mtl.media.domain.FotografiaRepository;
import com.mtl.media.integration.catalog.CatalogMediaPermissionClient;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MediaTreePhotoGalleryService {

  private final FotografiaRepository fotografiaRepository;
  private final CatalogMediaPermissionClient catalogMediaPermissionClient;

  public MediaTreePhotoGalleryService(
      FotografiaRepository fotografiaRepository,
      CatalogMediaPermissionClient catalogMediaPermissionClient) {
    this.fotografiaRepository = fotografiaRepository;
    this.catalogMediaPermissionClient = catalogMediaPermissionClient;
  }

  @Transactional(readOnly = true)
  public List<Fotografia> findVisiblePhotos(long treeId, Jwt jwt) {
    if (jwt == null) {
      return fotografiaRepository.findPublicForTreeOrdered(treeId);
    }
    if (hasRole(jwt, "ADMIN")) {
      return fotografiaRepository.findActiveForTreeOrdered(treeId);
    }
    long actorUsuarioAppId = catalogMediaPermissionClient.resolveActorUsuarioAppIdForTree(treeId, jwt);
    return fotografiaRepository.findVisibleForActorOrdered(treeId, actorUsuarioAppId);
  }

  @SuppressWarnings("unchecked")
  private boolean hasRole(Jwt jwt, String role) {
    Object realmAccess = jwt.getClaims().get("realm_access");
    if (!(realmAccess instanceof Map<?, ?> realmAccessMap)) {
      return false;
    }
    Object roles = realmAccessMap.get("roles");
    if (!(roles instanceof Collection<?> roleCollection)) {
      return false;
    }
    return roleCollection.stream().map(String::valueOf).anyMatch(role::equals);
  }
}
