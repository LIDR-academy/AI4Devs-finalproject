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
import com.mtl.catalog.infrastructure.persistence.jpa.repository.CollaboratorEjemplarReadRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.CollaboratorEjemplarDetailRow;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.CollaboratorEjemplarListRow;
import com.mtl.catalog.util.OidcUserProfileExtractor.OidcUserProfile;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
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
class CollaboratorEjemplarQueryServiceTest {

  @Mock private CollaboratorEjemplarReadRepository collaboratorEjemplarReadRepository;
  @Mock private UsuarioAppMaterializationService usuarioAppMaterializationService;
  @InjectMocks private CollaboratorEjemplarQueryService collaboratorEjemplarQueryService;

  @Test
  void listCollaboratorEjemplares_colaboradorFiltraPorUsuarioAppDelActor() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(7L));
    when(collaboratorEjemplarReadRepository.findCollaboratorEjemplarRows(
            eq(7L), isNull(), isNull(), isNull(), any(), any(), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(listRow())));

    var response =
        collaboratorEjemplarQueryService.listCollaboratorEjemplares(
            0,
            20,
            "modificado_en,desc",
            new CollaboratorEjemplarQueryService.CollaboratorEjemplarFilters(null, null, null, null),
            collaboratorJwt());

    assertEquals(1, response.content().size());
    assertEquals(42L, response.content().getFirst().ejemplarId());
    assertEquals("modificado_en,desc", response.sort());
  }

  @Test
  void listCollaboratorEjemplares_adminSinFiltroCreadorListaTodos() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(1L));
    when(collaboratorEjemplarReadRepository.findCollaboratorEjemplarRows(
            isNull(), isNull(), isNull(), isNull(), any(), any(), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of()));

    collaboratorEjemplarQueryService.listCollaboratorEjemplares(
        0,
        20,
        null,
        new CollaboratorEjemplarQueryService.CollaboratorEjemplarFilters(null, null, null, null),
        adminJwt());

    ArgumentCaptor<Long> ownerCaptor = ArgumentCaptor.forClass(Long.class);
    verify(collaboratorEjemplarReadRepository)
        .findCollaboratorEjemplarRows(
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
  void listCollaboratorEjemplares_adminConCreatedByUserIdFiltraPorEseId() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(1L));
    when(collaboratorEjemplarReadRepository.findCollaboratorEjemplarRows(
            eq(99L), isNull(), isNull(), isNull(), any(), any(), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of()));

    collaboratorEjemplarQueryService.listCollaboratorEjemplares(
        0,
        20,
        "creado_en,asc",
        new CollaboratorEjemplarQueryService.CollaboratorEjemplarFilters(null, null, null, 99L),
        adminJwt());

    verify(collaboratorEjemplarReadRepository)
        .findCollaboratorEjemplarRows(
            eq(99L), isNull(), isNull(), isNull(), eq("creado_en"), eq("asc"), any(Pageable.class));
  }

  @Test
  void listCollaboratorEjemplares_colaboradorConCreatedByUserId_devuelve403() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(7L));

    assertThrows(
        CatalogForbiddenException.class,
        () ->
            collaboratorEjemplarQueryService.listCollaboratorEjemplares(
                0,
                20,
                null,
                new CollaboratorEjemplarQueryService.CollaboratorEjemplarFilters(null, null, null, 99L),
                collaboratorJwt()));
  }

  @Test
  void listCollaboratorEjemplares_createdFromPosteriorACreatedTo_devuelve400() {
    assertThrows(
        CatalogValidationException.class,
        () ->
            collaboratorEjemplarQueryService.listCollaboratorEjemplares(
                0,
                20,
                null,
                new CollaboratorEjemplarQueryService.CollaboratorEjemplarFilters(
                    null, LocalDate.of(2024, 6, 2), LocalDate.of(2024, 6, 1), null),
                collaboratorJwt()));
  }

  @Test
  void getCollaboratorEjemplarDetail_colaboradorPropietario_devuelveDetalle() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(7L));
    when(collaboratorEjemplarReadRepository.findCollaboratorEjemplarDetailRow(42L))
        .thenReturn(Optional.of(detailRow(7L)));

    var detail =
        collaboratorEjemplarQueryService.getCollaboratorEjemplarDetail(42L, collaboratorJwt());

    assertEquals(42L, detail.ejemplarId());
    assertEquals(10L, detail.speciesId());
    assertEquals("Encina (Quercus ilex)", detail.speciesLabel());
    assertEquals("Madrid (28)", detail.provinceLabel());
    assertEquals(7L, detail.createdByUserId());
  }

  @Test
  void getCollaboratorEjemplarDetail_colaboradorAjeno_devuelve403() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(7L));
    when(collaboratorEjemplarReadRepository.findCollaboratorEjemplarDetailRow(42L))
        .thenReturn(Optional.of(detailRow(99L)));

    assertThrows(
        CatalogForbiddenException.class,
        () -> collaboratorEjemplarQueryService.getCollaboratorEjemplarDetail(42L, collaboratorJwt()));
  }

  @Test
  void getCollaboratorEjemplarDetail_adminPuedeConsultarAjeno() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(1L));
    when(collaboratorEjemplarReadRepository.findCollaboratorEjemplarDetailRow(42L))
        .thenReturn(Optional.of(detailRow(99L)));

    var detail =
        collaboratorEjemplarQueryService.getCollaboratorEjemplarDetail(42L, adminJwt());

    assertEquals(99L, detail.createdByUserId());
  }

  @Test
  void getCollaboratorEjemplarDetail_inexistente_devuelve404() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(7L));
    when(collaboratorEjemplarReadRepository.findCollaboratorEjemplarDetailRow(999L))
        .thenReturn(Optional.empty());

    assertThrows(
        CatalogNotFoundException.class,
        () -> collaboratorEjemplarQueryService.getCollaboratorEjemplarDetail(999L, collaboratorJwt()));
  }

  @Test
  void listCollaboratorEjemplares_sortInvalidoUsaModificadoEnDesc() {
    when(usuarioAppMaterializationService.materialize(any(OidcUserProfile.class)))
        .thenReturn(usuarioApp(7L));
    when(collaboratorEjemplarReadRepository.findCollaboratorEjemplarRows(
            any(), any(), any(), any(), any(), any(), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of()));

    collaboratorEjemplarQueryService.listCollaboratorEjemplares(
        0,
        20,
        "invalido,asc",
        new CollaboratorEjemplarQueryService.CollaboratorEjemplarFilters(null, null, null, null),
        collaboratorJwt());

    verify(collaboratorEjemplarReadRepository)
        .findCollaboratorEjemplarRows(
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

  private static CollaboratorEjemplarDetailRow detailRow(long createdByUserId) {
    return new CollaboratorEjemplarDetailRow() {
      @Override
      public Long getEjemplarId() {
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

  private static CollaboratorEjemplarListRow listRow() {
    return new CollaboratorEjemplarListRow() {
      @Override
      public Long getEjemplarId() {
        return 42L;
      }

      @Override
      public Long getSpeciesId() {
        return 10L;
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
      public String getProvince() {
        return "Madrid";
      }

      @Override
      public String getMunicipality() {
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
