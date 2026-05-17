package com.mtl.catalog.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.dto.CollaboratorTreeDetailDto;
import com.mtl.catalog.dto.CreateTreeRequest;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.CollaboratorTreeReadRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.CollaboratorTreeDetailRow;
import com.mtl.catalog.util.OidcUserProfileExtractor.OidcUserProfile;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class TreeModificationServiceTest {

  @Mock private UsuarioAppMaterializationService usuarioAppMaterializationService;
  @Mock private TreeUpdateService treeUpdateService;
  @Mock private CatalogAuditService catalogAuditService;
  @Mock private CollaboratorTreeReadRepository collaboratorTreeReadRepository;
  @InjectMocks private TreeModificationService treeModificationService;

  @Test
  void updateTree_registraAuditoriaSinKafka() {
    UsuarioApp actor = usuario(5L);
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class))).thenReturn(actor);
    when(treeUpdateService.update(eq(42L), any(UpdateTreeCommand.class), eq(5L), eq(false)))
        .thenReturn(new TreeUpdateResult(42L, 10L, 28L, 11L, 29L));
    when(collaboratorTreeReadRepository.findCollaboratorTreeDetailRow(42L))
        .thenReturn(Optional.of(detailRow()));

    CreateTreeRequest request =
        new CreateTreeRequest(
            11L, 29L, new BigDecimal("40"), new BigDecimal("-3"), null, null, null, null, null);

    CollaboratorTreeDetailDto out = treeModificationService.updateTree(42L, request, collaboratorJwt());

    assertThat(out.treeId()).isEqualTo(42L);
    verify(catalogAuditService)
        .recordTreeModified(eq(5L), eq(42L), eq(10L), eq(28L), eq(11L), eq(29L));
  }

  private static CollaboratorTreeDetailRow detailRow() {
    return new CollaboratorTreeDetailRow() {
      @Override
      public Long getTreeId() {
        return 42L;
      }

      @Override
      public Long getSpeciesId() {
        return 11L;
      }

      @Override
      public Long getProvinceId() {
        return 29L;
      }

      @Override
      public BigDecimal getLatitude() {
        return BigDecimal.ONE;
      }

      @Override
      public BigDecimal getLongitude() {
        return BigDecimal.ONE;
      }

      @Override
      public String getMunicipality() {
        return null;
      }

      @Override
      public String getDescription() {
        return null;
      }

      @Override
      public Integer getAltitude() {
        return null;
      }

      @Override
      public String getPublicationState() {
        return "PUBLICADO";
      }

      @Override
      public String getPublicMapVisibility() {
        return "PUBLICO";
      }

      @Override
      public Long getCreatedByUserId() {
        return 5L;
      }

      @Override
      public String getNombreComun() {
        return "Encina";
      }

      @Override
      public String getNombreCientifico() {
        return "Quercus ilex";
      }

      @Override
      public String getProvinciaNombre() {
        return "Madrid";
      }

      @Override
      public String getProvinciaCodigo() {
        return "28";
      }

      @Override
      public Instant getCreatedAt() {
        return Instant.parse("2024-01-01T10:00:00Z");
      }

      @Override
      public Instant getModifiedAt() {
        return Instant.parse("2024-02-01T12:00:00Z");
      }
    };
  }

  private static UsuarioApp usuario(long id) {
    UsuarioApp u = new UsuarioApp();
    u.setId(id);
    return u;
  }

  private static Jwt collaboratorJwt() {
    return Jwt.withTokenValue("t")
        .header("alg", "none")
        .subject("kc-sub")
        .claim("email", "u@example.invalid")
        .claim("realm_access", Map.of("roles", java.util.List.of("COLABORADOR")))
        .build();
  }
}
