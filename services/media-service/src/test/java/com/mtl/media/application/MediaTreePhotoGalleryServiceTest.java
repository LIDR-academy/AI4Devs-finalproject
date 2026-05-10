package com.mtl.media.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.media.domain.Fotografia;
import com.mtl.media.infrastructure.persistence.jpa.repository.FotografiaRepository;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class MediaTreePhotoGalleryServiceTest {

  @Mock private FotografiaRepository fotografiaRepository;

  @Test
  void anonymous_onlyPublicPhotos() {
    MediaTreePhotoGalleryService service = new MediaTreePhotoGalleryService(fotografiaRepository);
    when(fotografiaRepository.findPublicForTreeOrdered(10L)).thenReturn(List.of(new Fotografia()));

    List<Fotografia> result = service.findVisiblePhotos(10L, null);

    assertThat(result).hasSize(1);
    verify(fotografiaRepository).findPublicForTreeOrdered(10L);
  }

  @Test
  void admin_seesAllActivePhotos() {
    MediaTreePhotoGalleryService service = new MediaTreePhotoGalleryService(fotografiaRepository);
    Jwt adminJwt = jwtWithRoles("ADMIN");
    when(fotografiaRepository.findActiveForTreeOrdered(11L)).thenReturn(List.of(new Fotografia()));

    List<Fotografia> result = service.findVisiblePhotos(11L, adminJwt);

    assertThat(result).hasSize(1);
    verify(fotografiaRepository).findActiveForTreeOrdered(11L);
  }

  @Test
  void collaborator_seesOnlyPublicPhotosInDetailGallery() {
    MediaTreePhotoGalleryService service = new MediaTreePhotoGalleryService(fotografiaRepository);
    Jwt collaboratorJwt = jwtWithRoles("COLABORADOR");
    when(fotografiaRepository.findPublicForTreeOrdered(12L)).thenReturn(List.of(new Fotografia()));

    List<Fotografia> result = service.findVisiblePhotos(12L, collaboratorJwt);

    assertThat(result).hasSize(1);
    verify(fotografiaRepository).findPublicForTreeOrdered(12L);
  }

  @Test
  void anonymous_noPhotos_returnsEmptyList() {
    MediaTreePhotoGalleryService service = new MediaTreePhotoGalleryService(fotografiaRepository);
    when(fotografiaRepository.findPublicForTreeOrdered(15L)).thenReturn(List.of());

    List<Fotografia> result = service.findVisiblePhotos(15L, null);

    assertThat(result).isEmpty();
    verify(fotografiaRepository).findPublicForTreeOrdered(15L);
  }

  @Test
  void authenticatedNonAdmin_seesOnlyPublicPhotos() {
    MediaTreePhotoGalleryService service = new MediaTreePhotoGalleryService(fotografiaRepository);
    Jwt nonAdminJwt = jwtWithRoles("COLABORADOR");
    when(fotografiaRepository.findPublicForTreeOrdered(16L)).thenReturn(List.of(new Fotografia()));

    List<Fotografia> result = service.findVisiblePhotos(16L, nonAdminJwt);
    assertThat(result).hasSize(1);
    verify(fotografiaRepository).findPublicForTreeOrdered(16L);
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
