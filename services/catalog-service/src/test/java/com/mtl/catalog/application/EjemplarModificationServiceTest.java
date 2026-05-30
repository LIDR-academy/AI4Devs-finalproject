package com.mtl.catalog.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.dto.CollaboratorEjemplarDetailDto;
import com.mtl.catalog.dto.CreateEjemplarRequest;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.CollaboratorEjemplarReadRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.CollaboratorEjemplarDetailRow;
import com.mtl.catalog.util.OidcUserProfileExtractor.OidcUserProfile;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class EjemplarModificationServiceTest {

  @Mock private UsuarioAppMaterializationService usuarioAppMaterializationService;
  @Mock private EjemplarUpdateService treeUpdateService;
  @Mock private CatalogAuditService catalogAuditService;
  @Mock private CollaboratorEjemplarReadRepository collaboratorEjemplarReadRepository;
  @InjectMocks private EjemplarModificationService ejemplarModificationService;

  @Test
  void updateEjemplar_registraAuditoriaSinKafka() {
    UsuarioApp actor = usuario(5L);
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class))).thenReturn(actor);
    when(treeUpdateService.update(eq(42L), any(UpdateEjemplarCommand.class), eq(5L), eq(false)))
        .thenReturn(new EjemplarUpdateResult(42L, 10L, 28L, 11L, 29L));
    when(collaboratorEjemplarReadRepository.findCollaboratorEjemplarDetailRow(42L))
        .thenReturn(Optional.of(detailRow()));

    CreateEjemplarRequest request =
        new CreateEjemplarRequest(
            11L, 29L, new BigDecimal("40"), new BigDecimal("-3"), null, null, null, null, null);

    CollaboratorEjemplarDetailDto out = ejemplarModificationService.updateEjemplar(42L, request, collaboratorJwt());

    assertThat(out.ejemplarId()).isEqualTo(42L);
    verify(catalogAuditService)
        .recordEjemplarModified(eq(5L), eq(42L), eq(10L), eq(28L), eq(11L), eq(29L));
  }

  private static CollaboratorEjemplarDetailRow detailRow() {
    return new CollaboratorEjemplarDetailRow() {
      @Override
      public Long getEjemplarId() {
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
      public String getCommonName() {
        return "Encina";
      }

      @Override
      public String getScientificName() {
        return "Quercus ilex";
      }

      @Override
      public String getProvinceName() {
        return "Madrid";
      }

      @Override
      public String getProvinceCode() {
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
