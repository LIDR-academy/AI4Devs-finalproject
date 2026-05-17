package com.mtl.catalog.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.exception.CatalogValidationException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.CollaboratorTreeReadRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.CollaboratorTreeDetailRow;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.CollaboratorTreeListRow;
import com.mtl.catalog.util.OidcUserProfileExtractor.OidcUserProfile;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class CollaboratorTreeQueryServiceTest {

  @Mock private CollaboratorTreeReadRepository collaboratorTreeReadRepository;
  @Mock private UsuarioAppMaterializationService usuarioAppMaterializationService;
  @InjectMocks private CollaboratorTreeQueryService collaboratorTreeQueryService;

  @Test
  void listCollaboratorTrees_colaboradorFiltraPorUsuarioAppDelActor() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(7L));
    when(collaboratorTreeReadRepository.findCollaboratorTreeRows(
            eq(7L), isNull(), isNull(), isNull(), any(), any(), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(listRow())));

    var response =
        collaboratorTreeQueryService.listCollaboratorTrees(
            0,
            20,
            "modificado_en,desc",
            new CollaboratorTreeQueryService.CollaboratorTreeFilters(null, null, null, null),
            collaboratorJwt());

    assertEquals(1, response.content().size());
    assertEquals(42L, response.content().getFirst().treeId());
    assertEquals("modificado_en,desc", response.sort());
  }

  @Test
  void listCollaboratorTrees_adminSinFiltroCreadorListaTodos() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(1L));
    when(collaboratorTreeReadRepository.findCollaboratorTreeRows(
            isNull(), isNull(), isNull(), isNull(), any(), any(), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of()));

    collaboratorTreeQueryService.listCollaboratorTrees(
        0,
        20,
        null,
        new CollaboratorTreeQueryService.CollaboratorTreeFilters(null, null, null, null),
        adminJwt());

    ArgumentCaptor<Long> ownerCaptor = ArgumentCaptor.forClass(Long.class);
    verify(collaboratorTreeReadRepository)
        .findCollaboratorTreeRows(
            ownerCaptor.capture(),
            isNull(),
            isNull(),
            isNull(),
            eq("modificado_en"),
            eq("desc"),
            any(Pageable.class));
    assertNull(ownerCaptor.getValue());
  }

  @Test
  void listCollaboratorTrees_adminConCreatedByUserIdFiltraPorEseId() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(1L));
    when(collaboratorTreeReadRepository.findCollaboratorTreeRows(
            eq(99L), isNull(), isNull(), isNull(), any(), any(), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of()));

    collaboratorTreeQueryService.listCollaboratorTrees(
        0,
        20,
        "creado_en,asc",
        new CollaboratorTreeQueryService.CollaboratorTreeFilters(null, null, null, 99L),
        adminJwt());

    verify(collaboratorTreeReadRepository)
        .findCollaboratorTreeRows(
            eq(99L), isNull(), isNull(), isNull(), eq("creado_en"), eq("asc"), any(Pageable.class));
  }

  @Test
  void listCollaboratorTrees_colaboradorConCreatedByUserId_devuelve403() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(7L));

    assertThrows(
        CatalogForbiddenException.class,
        () ->
            collaboratorTreeQueryService.listCollaboratorTrees(
                0,
                20,
                null,
                new CollaboratorTreeQueryService.CollaboratorTreeFilters(null, null, null, 99L),
                collaboratorJwt()));
  }

  @Test
  void listCollaboratorTrees_createdFromPosteriorACreatedTo_devuelve400() {
    assertThrows(
        CatalogValidationException.class,
        () ->
            collaboratorTreeQueryService.listCollaboratorTrees(
                0,
                20,
                null,
                new CollaboratorTreeQueryService.CollaboratorTreeFilters(
                    null, LocalDate.of(2024, 6, 2), LocalDate.of(2024, 6, 1), null),
                collaboratorJwt()));
  }

  @Test
  void getCollaboratorTreeDetail_colaboradorPropietario_devuelveDetalle() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(7L));
    when(collaboratorTreeReadRepository.findCollaboratorTreeDetailRow(42L))
        .thenReturn(Optional.of(detailRow(7L)));

    var detail =
        collaboratorTreeQueryService.getCollaboratorTreeDetail(42L, collaboratorJwt());

    assertEquals(42L, detail.treeId());
    assertEquals(10L, detail.speciesId());
    assertEquals("Encina (Quercus ilex)", detail.speciesLabel());
    assertEquals("Madrid (28)", detail.provinceLabel());
    assertEquals(7L, detail.createdByUserId());
  }

  @Test
  void getCollaboratorTreeDetail_colaboradorAjeno_devuelve403() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(7L));
    when(collaboratorTreeReadRepository.findCollaboratorTreeDetailRow(42L))
        .thenReturn(Optional.of(detailRow(99L)));

    assertThrows(
        CatalogForbiddenException.class,
        () -> collaboratorTreeQueryService.getCollaboratorTreeDetail(42L, collaboratorJwt()));
  }

  @Test
  void getCollaboratorTreeDetail_adminPuedeConsultarAjeno() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(1L));
    when(collaboratorTreeReadRepository.findCollaboratorTreeDetailRow(42L))
        .thenReturn(Optional.of(detailRow(99L)));

    var detail =
        collaboratorTreeQueryService.getCollaboratorTreeDetail(42L, adminJwt());

    assertEquals(99L, detail.createdByUserId());
  }

  @Test
  void getCollaboratorTreeDetail_inexistente_devuelve404() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(7L));
    when(collaboratorTreeReadRepository.findCollaboratorTreeDetailRow(999L))
        .thenReturn(Optional.empty());

    assertThrows(
        CatalogNotFoundException.class,
        () -> collaboratorTreeQueryService.getCollaboratorTreeDetail(999L, collaboratorJwt()));
  }

  @Test
  void listCollaboratorTrees_sortInvalidoUsaModificadoEnDesc() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(7L));
    when(collaboratorTreeReadRepository.findCollaboratorTreeRows(
            any(), any(), any(), any(), any(), any(), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of()));

    collaboratorTreeQueryService.listCollaboratorTrees(
        0,
        20,
        "invalido,asc",
        new CollaboratorTreeQueryService.CollaboratorTreeFilters(null, null, null, null),
        collaboratorJwt());

    verify(collaboratorTreeReadRepository)
        .findCollaboratorTreeRows(
            any(), any(), any(), any(), eq("modificado_en"), eq("desc"), any(Pageable.class));
  }

  private static UsuarioApp usuarioApp(long id) {
    UsuarioApp usuario = new UsuarioApp();
    usuario.setId(id);
    return usuario;
  }

  private static Jwt collaboratorJwt() {
    return Jwt.withTokenValue("t")
        .header("alg", "none")
        .subject("kc-sub")
        .claim("realm_access", Map.of("roles", List.of("COLABORADOR")))
        .build();
  }

  private static Jwt adminJwt() {
    return Jwt.withTokenValue("t")
        .header("alg", "none")
        .subject("admin-sub")
        .claim("realm_access", Map.of("roles", List.of("ADMIN")))
        .build();
  }

  private static CollaboratorTreeDetailRow detailRow(long createdByUserId) {
    return new CollaboratorTreeDetailRow() {
      @Override
      public Long getTreeId() {
        return 42L;
      }

      @Override
      public Long getSpeciesId() {
        return 10L;
      }

      @Override
      public Long getProvinceId() {
        return 28L;
      }

      @Override
      public BigDecimal getLatitude() {
        return new BigDecimal("40.4168");
      }

      @Override
      public BigDecimal getLongitude() {
        return new BigDecimal("-3.7038");
      }

      @Override
      public String getMunicipality() {
        return "Madrid";
      }

      @Override
      public String getDescription() {
        return "Nota";
      }

      @Override
      public Integer getAltitude() {
        return 600;
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
        return createdByUserId;
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

  private static CollaboratorTreeListRow listRow() {
    return new CollaboratorTreeListRow() {
      @Override
      public Long getTreeId() {
        return 42L;
      }

      @Override
      public Long getSpeciesId() {
        return 10L;
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
      public String getProvincia() {
        return "Madrid";
      }

      @Override
      public String getMunicipio() {
        return "Madrid";
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
      public Instant getCreatedAt() {
        return Instant.parse("2024-01-01T10:00:00Z");
      }

      @Override
      public Instant getModifiedAt() {
        return Instant.parse("2024-02-01T12:00:00Z");
      }

      @Override
      public Long getCreatedByUserId() {
        return 7L;
      }
    };
  }
}
