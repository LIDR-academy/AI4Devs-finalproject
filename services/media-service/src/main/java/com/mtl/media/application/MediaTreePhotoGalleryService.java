package com.mtl.media.application;

import com.mtl.media.domain.Fotografia;
import com.mtl.media.infrastructure.persistence.jpa.repository.FotografiaRepository;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MediaTreePhotoGalleryService {

  private final FotografiaRepository fotografiaRepository;

  public MediaTreePhotoGalleryService(FotografiaRepository fotografiaRepository) {
    this.fotografiaRepository = fotografiaRepository;
  }

  @Transactional(readOnly = true)
  public List<Fotografia> findVisiblePhotos(long treeId, Jwt jwt) {
    if (jwt == null || !hasRole(jwt, "ADMIN")) {
      return fotografiaRepository.findPublicForTreeOrdered(treeId);
    }
    return fotografiaRepository.findActiveForTreeOrdered(treeId);
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
