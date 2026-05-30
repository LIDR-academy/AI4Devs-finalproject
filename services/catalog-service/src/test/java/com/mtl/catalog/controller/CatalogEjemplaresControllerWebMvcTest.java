package com.mtl.catalog.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mtl.catalog.application.CollaboratorEjemplarQueryService;
import com.mtl.catalog.application.CreatedEjemplarResult;
import com.mtl.catalog.application.PublicEjemplarQueryService;
import com.mtl.catalog.application.EjemplarMediaSubmissionPermissionService;
import com.mtl.catalog.application.EjemplarDeletionService;
import com.mtl.catalog.application.EjemplarModificationService;
import com.mtl.catalog.application.EjemplarRegistrationService;
import com.mtl.catalog.dto.CollaboratorEjemplarDetailDto;
import com.mtl.catalog.dto.CollaboratorEjemplarListItemDto;
import com.mtl.catalog.dto.CollaboratorEjemplarPageResponse;
import com.mtl.catalog.config.JwtAuthenticationPrincipalTestMvcConfig;
import com.mtl.catalog.dto.MediaSubmissionPermissionResponse;
import com.mtl.catalog.dto.PublicEjemplarDetailDto;
import com.mtl.catalog.dto.PublicEjemplarListItemDto;
import com.mtl.catalog.dto.PublicEjemplarPageResponse;
import com.mtl.catalog.exception.CatalogNotFoundException;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.oauth2.server.resource.autoconfigure.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@WebMvcTest(
    controllers = CatalogEjemplaresController.class,
    excludeAutoConfiguration = OAuth2ResourceServerAutoConfiguration.class)
@Import(JwtAuthenticationPrincipalTestMvcConfig.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class CatalogEjemplaresControllerWebMvcTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private EjemplarRegistrationService ejemplarRegistrationService;
  @MockitoBean private EjemplarModificationService ejemplarModificationService;
  @MockitoBean private EjemplarDeletionService ejemplarDeletionService;
  @MockitoBean private CollaboratorEjemplarQueryService collaboratorEjemplarQueryService;
  @MockitoBean private PublicEjemplarQueryService publicEjemplarQueryService;
  @MockitoBean private EjemplarMediaSubmissionPermissionService ejemplarMediaSubmissionPermissionService;

  @AfterEach
  void clearSecurityContext() {
    SecurityContextHolder.clearContext();
  }

  private static MockHttpServletRequestBuilder withJwtPrincipal(
      MockHttpServletRequestBuilder builder, Authentication authentication) {
    return builder.with(
        request -> {
          SecurityContextHolder.getContext().setAuthentication(authentication);
          return request;
        });
  }

  private static JwtAuthenticationToken collaboratorAuthentication() {
    Jwt jwt =
        Jwt.withTokenValue("dummy.jwt.value")
            .headers(h -> h.put("alg", "none"))
            .issuer("http://localhost:8180/realms/mtl")
            .subject("kc-sub")
            .audience(Collections.singletonList("account"))
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600))
            .claim("email", "u@example.invalid")
            .claim("name", "Usuario Prueba")
            .build();

    return new JwtAuthenticationToken(
        jwt, Collections.singleton(new SimpleGrantedAuthority("ROLE_COLABORADOR")));
  }

  @Test
  void postTrees_creado201() throws Exception {
    when(ejemplarRegistrationService.register(any(), any()))
        .thenReturn(new CreatedEjemplarResult(42L, 5L, OffsetDateTime.parse("2024-01-02T12:00:00Z")));

    JwtAuthenticationToken authentication = collaboratorAuthentication();

    mockMvc
        .perform(
            withJwtPrincipal(
                post("/api/catalog/ejemplares")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "speciesId": 10,
                          "provinceId": 28,
                          "latitude": 40.0,
                          "longitude": -3.5
                        }
                        """),
                authentication))
        .andExpect(status().isCreated())
        .andExpect(header().exists("Location"))
        .andExpect(jsonPath("$.ejemplarId").value(42));
  }

  @Test
  void postTrees_cuerpoInvalido_devuelve400() throws Exception {
    Jwt jwt =
        Jwt.withTokenValue("dummy.jwt.value")
            .headers(h -> h.put("alg", "none"))
            .issuer("http://localhost:8180/realms/mtl")
            .subject("s")
            .audience(Collections.singletonList("account"))
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600))
            .claim("email", "a@b.co")
            .build();

    JwtAuthenticationToken authentication =
        new JwtAuthenticationToken(
            jwt, Collections.singleton(new SimpleGrantedAuthority("ROLE_COLABORADOR")));

    mockMvc
        .perform(
            withJwtPrincipal(
                post("/api/catalog/ejemplares")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"speciesId\":1}"),
                authentication))
        .andExpect(status().isBadRequest());
  }

  @Test
  void putCollaboratorTree_devuelve200ConDetalle() throws Exception {
    when(ejemplarModificationService.updateEjemplar(anyLong(), any(), any(Jwt.class)))
        .thenReturn(
            new CollaboratorEjemplarDetailDto(
                42L,
                11L,
                29L,
                new BigDecimal("40.4168"),
                new BigDecimal("-3.7038"),
                "Madrid",
                "Nota",
                600,
                "PUBLICADO",
                "PUBLICO",
                7L,
                "Encina (Quercus ilex)",
                "Madrid (29)",
                OffsetDateTime.parse("2024-01-01T10:00:00Z"),
                OffsetDateTime.parse("2024-02-01T12:00:00Z")));

    mockMvc
        .perform(
            withJwtPrincipal(
                put("/api/catalog/ejemplares/{ejemplarId}", 42)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "speciesId": 11,
                          "provinceId": 29,
                          "latitude": 40.4168,
                          "longitude": -3.7038,
                          "publicationState": "PUBLICADO",
                          "publicMapVisibility": "PUBLICO"
                        }
                        """),
                collaboratorAuthentication()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.ejemplarId").value(42))
        .andExpect(jsonPath("$.speciesId").value(11))
        .andExpect(jsonPath("$.createdByUserId").value(7));
  }

  @Test
  void getCollaboratorEjemplarDetail_devuelve200() throws Exception {
    when(collaboratorEjemplarQueryService.getCollaboratorEjemplarDetail(anyLong(), any(Jwt.class)))
        .thenReturn(
            new CollaboratorEjemplarDetailDto(
                42L,
                10L,
                28L,
                new BigDecimal("40.4168"),
                new BigDecimal("-3.7038"),
                "Madrid",
                "Nota",
                600,
                "PUBLICADO",
                "PUBLICO",
                7L,
                "Encina (Quercus ilex)",
                "Madrid (28)",
                OffsetDateTime.parse("2024-01-01T10:00:00Z"),
                OffsetDateTime.parse("2024-02-01T12:00:00Z")));

    mockMvc
        .perform(
            withJwtPrincipal(
                get("/api/catalog/ejemplares/{ejemplarId}", 42), collaboratorAuthentication()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.ejemplarId").value(42))
        .andExpect(jsonPath("$.speciesId").value(10))
        .andExpect(jsonPath("$.provinceId").value(28))
        .andExpect(jsonPath("$.speciesLabel").value("Encina (Quercus ilex)"))
        .andExpect(jsonPath("$.createdByUserId").value(7));
  }

  @Test
  void getCollaboratorTrees_devuelve200ConListadoPaginado() throws Exception {
    when(
            collaboratorEjemplarQueryService.listCollaboratorEjemplares(
                anyInt(),
                anyInt(),
                anyString(),
                any(CollaboratorEjemplarQueryService.CollaboratorEjemplarFilters.class),
                any(Jwt.class)))
        .thenReturn(
            new CollaboratorEjemplarPageResponse(
                List.of(
                    new CollaboratorEjemplarListItemDto(
                        42L,
                        10L,
                        "Encina",
                        "Quercus ilex",
                        "Madrid",
                        "Madrid",
                        "PUBLICADO",
                        "PUBLICO",
                        OffsetDateTime.parse("2024-01-01T10:00:00Z"),
                        OffsetDateTime.parse("2024-02-01T12:00:00Z"),
                        7L)),
                1L,
                0,
                20,
                "modificado_en,desc"));

    mockMvc
        .perform(
            withJwtPrincipal(
                get("/api/catalog/ejemplares")
                    .param("page", "0")
                    .param("size", "20")
                    .param("speciesId", "10")
                    .param("createdFrom", "2024-01-01")
                    .param("createdTo", "2024-12-31"),
                collaboratorAuthentication()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalResults").value(1))
        .andExpect(jsonPath("$.content[0].ejemplarId").value(42))
        .andExpect(jsonPath("$.content[0].speciesId").value(10))
        .andExpect(jsonPath("$.content[0].publicationState").value("PUBLICADO"))
        .andExpect(jsonPath("$.content[0].createdByUserId").value(7));
  }

  @Test
  void getPublicTrees_devuelve200ConListadoPaginado() throws Exception {
    when(
            publicEjemplarQueryService.listPublishedEjemplares(
                anyInt(),
                anyInt(),
                anyString(),
                any(PublicEjemplarQueryService.PublicEjemplarFilters.class),
                nullable(Jwt.class)))
        .thenReturn(
            new PublicEjemplarPageResponse(
                List.of(
                    new PublicEjemplarListItemDto(
                        42L,
                        "Encina",
                        "Quercus ilex",
                        "Madrid",
                        "Madrid",
                        "PUBLICADO",
                        "PUBLICO")),
                1L,
                0,
                20,
                "especie,asc"));

    mockMvc
        .perform(
            withJwtPrincipal(
                get("/api/catalog/public/ejemplares")
                    .param("page", "0")
                    .param("size", "20")
                    .param("especie", "Quercus"),
                collaboratorAuthentication()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalResults").value(1))
        .andExpect(jsonPath("$.content[0].ejemplarId").value(42))
        .andExpect(jsonPath("$.content[0].publicationState").value("PUBLICADO"))
        .andExpect(jsonPath("$.content[0].publicMapVisibility").value("PUBLICO"));
  }

  @Test
  void getPublicEjemplarDetail_devuelve200() throws Exception {
    when(publicEjemplarQueryService.getPublishedEjemplarDetail(anyLong(), nullable(Jwt.class)))
        .thenReturn(
            new PublicEjemplarDetailDto(
                42L,
                "Encina",
                "Quercus ilex",
                "Madrid",
                "Madrid",
                "PUBLICADO",
                "PUBLICO",
                "Encina singular",
                new BigDecimal("40.4168"),
                new BigDecimal("-3.7038"),
                667));

    mockMvc
        .perform(
            withJwtPrincipal(
                get("/api/catalog/public/ejemplares/{ejemplarId}", 42), collaboratorAuthentication()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.ejemplarId").value(42))
        .andExpect(jsonPath("$.description").value("Encina singular"))
        .andExpect(jsonPath("$.latitude").value(40.4168))
        .andExpect(jsonPath("$.longitude").value(-3.7038))
        .andExpect(jsonPath("$.altitude").value(667));
  }

  @Test
  void getPublicEjemplarDetail_noEncontradoDevuelve404() throws Exception {
    when(publicEjemplarQueryService.getPublishedEjemplarDetail(anyLong(), nullable(Jwt.class)))
        .thenThrow(new CatalogNotFoundException("No encontrado"));

    mockMvc
        .perform(
            withJwtPrincipal(
                get("/api/catalog/public/ejemplares/{ejemplarId}", 999), collaboratorAuthentication()))
        .andExpect(status().isNotFound());
  }

  @Test
  void deleteCollaboratorEjemplar_devuelve204() throws Exception {
    mockMvc
        .perform(
            withJwtPrincipal(
                delete("/api/catalog/ejemplares/{ejemplarId}", 42), collaboratorAuthentication()))
        .andExpect(status().isNoContent());

    verify(ejemplarDeletionService).deleteEjemplar(eq(42L), any(Jwt.class));
  }

  @Test
  void getMediaSubmissionPermission_devuelve200() throws Exception {
    when(ejemplarMediaSubmissionPermissionService.resolve(anyLong(), any(Jwt.class)))
        .thenReturn(new MediaSubmissionPermissionResponse(42L, 7L));

    mockMvc
        .perform(
            withJwtPrincipal(
                get("/api/catalog/ejemplares/{ejemplarId}/media-submission-permission", 42),
                collaboratorAuthentication()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.ejemplarId").value(42))
        .andExpect(jsonPath("$.actorUsuarioAppId").value(7));
  }
}
