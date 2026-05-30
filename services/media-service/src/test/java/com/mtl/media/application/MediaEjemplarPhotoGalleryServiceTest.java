package com.mtl.media.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.mtl.media.domain.Fotografia;
import com.mtl.media.infrastructure.client.catalog.CatalogMediaPermissionClient;
import com.mtl.media.infrastructure.client.catalog.CatalogPublicTreeVisibilityGuard;
import com.mtl.media.infrastructure.persistence.jpa.repository.FotografiaRepository;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class MediaEjemplarPhotoGalleryServiceTest {

  @Mock private FotografiaRepository fotografiaRepository;
  @Mock private CatalogMediaPermissionClient catalogMediaPermissionClient;
  @Mock private CatalogPublicTreeVisibilityGuard catalogPublicTreeVisibilityGuard;

  @Test
  void anonymous_checksCatalogVisibilityBeforePublicPhotos() {
    MediaEjemplarPhotoGalleryService service = newService();
    when(fotografiaRepository.findPublicForEjemplarOrdered(10L)).thenReturn(List.of(new Fotografia()));

    List<Fotografia> result = service.findVisiblePhotos(10L, null);

    assertThat(result).hasSize(1);
    verify(catalogPublicTreeVisibilityGuard).assertVisibleInPublicCatalog(10L, null);
    verify(fotografiaRepository).findPublicForEjemplarOrdered(10L);
  }

  @Test
  void anonymous_treeNotInPublicCatalog_returns404() {
    MediaEjemplarPhotoGalleryService service = newService();
    doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Ejemplar no disponible en consulta pública"))
        .when(catalogPublicTreeVisibilityGuard)
        .assertVisibleInPublicCatalog(10L, null);

    assertThatThrownBy(() -> service.findVisiblePhotos(10L, null))
        .isInstanceOf(ResponseStatusException.class)
        .matches(ex -> ((ResponseStatusException) ex).getStatusCode() == HttpStatus.NOT_FOUND);

    verifyNoInteractions(fotografiaRepository);
  }

  @Test
  void actorWithPermission_seesAllActivePhotosWithoutPublicCatalogCheck() {
    MediaEjemplarPhotoGalleryService service = newService();
    Jwt jwt = jwtWithRoles("COLABORADOR");
    when(catalogMediaPermissionClient.hasPhotoManagementPermission(11L, jwt)).thenReturn(true);
    when(fotografiaRepository.findActiveForEjemplarOrdered(11L)).thenReturn(List.of(new Fotografia()));

    List<Fotografia> result = service.findVisiblePhotos(11L, jwt);

    assertThat(result).hasSize(1);
    verify(fotografiaRepository).findActiveForEjemplarOrdered(11L);
    verifyNoInteractions(catalogPublicTreeVisibilityGuard);
  }

  @Test
  void adminWithPermission_seesAllActivePhotosWithoutPublicCatalogCheck() {
    MediaEjemplarPhotoGalleryService service = newService();
    Jwt adminJwt = jwtWithRoles("ADMIN");
    when(catalogMediaPermissionClient.hasPhotoManagementPermission(12L, adminJwt)).thenReturn(true);
    when(fotografiaRepository.findActiveForEjemplarOrdered(12L)).thenReturn(List.of(new Fotografia()));

    List<Fotografia> result = service.findVisiblePhotos(12L, adminJwt);

    assertThat(result).hasSize(1);
    verify(fotografiaRepository).findActiveForEjemplarOrdered(12L);
    verifyNoInteractions(catalogPublicTreeVisibilityGuard);
  }

  @Test
  void authenticatedWithoutPermission_checksCatalogThenPublicPhotos() {
    MediaEjemplarPhotoGalleryService service = newService();
    Jwt jwt = jwtWithRoles("COLABORADOR");
    when(catalogMediaPermissionClient.hasPhotoManagementPermission(16L, jwt)).thenReturn(false);
    when(fotografiaRepository.findPublicForEjemplarOrdered(16L)).thenReturn(List.of(new Fotografia()));

    List<Fotografia> result = service.findVisiblePhotos(16L, jwt);

    assertThat(result).hasSize(1);
    verify(catalogPublicTreeVisibilityGuard).assertVisibleInPublicCatalog(16L, jwt);
    verify(fotografiaRepository).findPublicForEjemplarOrdered(16L);
  }

  @Test
  void anonymous_noPhotos_returnsEmptyListAfterCatalogCheck() {
    MediaEjemplarPhotoGalleryService service = newService();
    when(fotografiaRepository.findPublicForEjemplarOrdered(15L)).thenReturn(List.of());

    List<Fotografia> result = service.findVisiblePhotos(15L, null);

    assertThat(result).isEmpty();
    verify(catalogPublicTreeVisibilityGuard).assertVisibleInPublicCatalog(15L, null);
    verify(fotografiaRepository).findPublicForEjemplarOrdered(15L);
  }

  private MediaEjemplarPhotoGalleryService newService() {
    return new MediaEjemplarPhotoGalleryService(
        fotografiaRepository, catalogMediaPermissionClient, catalogPublicTreeVisibilityGuard);
  }

  private Jwt jwtWithRoles(String... roles) {
    return Jwt.withTokenValue("token")
        .header("alg", "none")
        .issuer("http://localhost:8180/realms/mtl")
        .subject("sub")
        .issuedAt(Instant.now())
        .expiresAt(Instant.now().plusSeconds(3600))
        .claim("realm_access", java.util.Map.of("roles", java.util.List.of(roles)))
        .build();
  }
}
