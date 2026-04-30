package com.mtl.media.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.media.domain.Fotografia;
import com.mtl.media.domain.FotografiaRepository;
import com.mtl.media.integration.catalog.CatalogMediaPermissionClient;
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
class MediaTreePhotoGalleryServiceTest {

  @Mock private FotografiaRepository fotografiaRepository;
  @Mock private CatalogMediaPermissionClient catalogMediaPermissionClient;

  @Test
  void anonymous_onlyPublicPhotos() {
    MediaTreePhotoGalleryService service =
        new MediaTreePhotoGalleryService(fotografiaRepository, catalogMediaPermissionClient);
    when(fotografiaRepository.findPublicForTreeOrdered(10L)).thenReturn(List.of(new Fotografia()));

    List<Fotografia> result = service.findVisiblePhotos(10L, null);

    assertThat(result).hasSize(1);
    verify(fotografiaRepository).findPublicForTreeOrdered(10L);
  }

  @Test
  void admin_seesAllActivePhotos() {
    MediaTreePhotoGalleryService service =
        new MediaTreePhotoGalleryService(fotografiaRepository, catalogMediaPermissionClient);
    Jwt adminJwt = jwtWithRoles("ADMIN");
    when(fotografiaRepository.findActiveForTreeOrdered(11L)).thenReturn(List.of(new Fotografia()));

    List<Fotografia> result = service.findVisiblePhotos(11L, adminJwt);

    assertThat(result).hasSize(1);
    verify(fotografiaRepository).findActiveForTreeOrdered(11L);
  }

  @Test
  void collaborator_seesPublicAndOwnPrivatePhotos() {
    MediaTreePhotoGalleryService service =
        new MediaTreePhotoGalleryService(fotografiaRepository, catalogMediaPermissionClient);
    Jwt collaboratorJwt = jwtWithRoles("COLABORADOR");
    when(catalogMediaPermissionClient.resolveActorUsuarioAppIdForTree(12L, collaboratorJwt))
        .thenReturn(77L);
    when(fotografiaRepository.findVisibleForActorOrdered(12L, 77L))
        .thenReturn(List.of(new Fotografia(), new Fotografia()));

    List<Fotografia> result = service.findVisiblePhotos(12L, collaboratorJwt);

    assertThat(result).hasSize(2);
    verify(catalogMediaPermissionClient).resolveActorUsuarioAppIdForTree(12L, collaboratorJwt);
    verify(fotografiaRepository).findVisibleForActorOrdered(12L, 77L);
  }

  @Test
  void anonymous_noPhotos_returnsEmptyList() {
    MediaTreePhotoGalleryService service =
        new MediaTreePhotoGalleryService(fotografiaRepository, catalogMediaPermissionClient);
    when(fotografiaRepository.findPublicForTreeOrdered(15L)).thenReturn(List.of());

    List<Fotografia> result = service.findVisiblePhotos(15L, null);

    assertThat(result).isEmpty();
    verify(fotografiaRepository).findPublicForTreeOrdered(15L);
  }

  @Test
  void collaborator_withoutPermission_propagatesForbidden() {
    MediaTreePhotoGalleryService service =
        new MediaTreePhotoGalleryService(fotografiaRepository, catalogMediaPermissionClient);
    Jwt collaboratorJwt = jwtWithRoles("COLABORADOR");
    when(catalogMediaPermissionClient.resolveActorUsuarioAppIdForTree(16L, collaboratorJwt))
        .thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "No tiene permiso"));

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> service.findVisiblePhotos(16L, collaboratorJwt));

    assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
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
