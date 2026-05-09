package com.mtl.catalog.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mtl.catalog.application.CreatedTreeResult;
import com.mtl.catalog.application.PublicTreeQueryService;
import com.mtl.catalog.application.TreeMediaSubmissionPermissionService;
import com.mtl.catalog.application.TreeRegistrationService;
import com.mtl.catalog.config.JwtAuthenticationPrincipalTestMvcConfig;
import com.mtl.catalog.dto.MediaSubmissionPermissionResponse;
import com.mtl.catalog.dto.PublicTreeDetailDto;
import com.mtl.catalog.dto.PublicTreeListItemDto;
import com.mtl.catalog.dto.PublicTreePageResponse;
import com.mtl.catalog.exception.CatalogNotFoundException;
import java.math.BigDecimal;
import java.time.Instant;
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
    controllers = CatalogTreesController.class,
    excludeAutoConfiguration = OAuth2ResourceServerAutoConfiguration.class)
@Import(JwtAuthenticationPrincipalTestMvcConfig.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class CatalogTreesControllerWebMvcTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private TreeRegistrationService treeRegistrationService;
  @MockitoBean private PublicTreeQueryService publicTreeQueryService;
  @MockitoBean private TreeMediaSubmissionPermissionService treeMediaSubmissionPermissionService;

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
    when(treeRegistrationService.register(any(), any()))
        .thenReturn(new CreatedTreeResult(42L, 5L, Instant.parse("2024-01-02T12:00:00Z")));

    JwtAuthenticationToken authentication = collaboratorAuthentication();

    mockMvc
        .perform(
            withJwtPrincipal(
                post("/api/catalog/trees")
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
        .andExpect(jsonPath("$.treeId").value(42));
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
                post("/api/catalog/trees")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"speciesId\":1}"),
                authentication))
        .andExpect(status().isBadRequest());
  }

  @Test
  void getPublicTrees_devuelve200ConListadoPaginado() throws Exception {
    when(
            publicTreeQueryService.listPublishedTrees(
                anyInt(),
                anyInt(),
                anyString(),
                any(PublicTreeQueryService.PublicTreeFilters.class),
                nullable(Jwt.class)))
        .thenReturn(
            new PublicTreePageResponse(
                List.of(
                    new PublicTreeListItemDto(
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
                get("/api/catalog/public/trees")
                    .param("page", "0")
                    .param("size", "20")
                    .param("especie", "Quercus"),
                collaboratorAuthentication()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalResults").value(1))
        .andExpect(jsonPath("$.content[0].treeId").value(42))
        .andExpect(jsonPath("$.content[0].estado").value("PUBLICADO"))
        .andExpect(jsonPath("$.content[0].visibilidad").value("PUBLICO"));
  }

  @Test
  void getPublicTreeDetail_devuelve200() throws Exception {
    when(publicTreeQueryService.getPublishedTreeDetail(anyLong(), nullable(Jwt.class)))
        .thenReturn(
            new PublicTreeDetailDto(
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
                get("/api/catalog/public/trees/{treeId}", 42), collaboratorAuthentication()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.treeId").value(42))
        .andExpect(jsonPath("$.descripcion").value("Encina singular"))
        .andExpect(jsonPath("$.latitud").value(40.4168))
        .andExpect(jsonPath("$.longitud").value(-3.7038))
        .andExpect(jsonPath("$.altura").value(667));
  }

  @Test
  void getPublicTreeDetail_noEncontradoDevuelve404() throws Exception {
    when(publicTreeQueryService.getPublishedTreeDetail(anyLong(), nullable(Jwt.class)))
        .thenThrow(new CatalogNotFoundException("No encontrado"));

    mockMvc
        .perform(
            withJwtPrincipal(
                get("/api/catalog/public/trees/{treeId}", 999), collaboratorAuthentication()))
        .andExpect(status().isNotFound());
  }

  @Test
  void getMediaSubmissionPermission_devuelve200() throws Exception {
    when(treeMediaSubmissionPermissionService.resolve(anyLong(), any(Jwt.class)))
        .thenReturn(new MediaSubmissionPermissionResponse(42L, 7L));

    mockMvc
        .perform(
            withJwtPrincipal(
                get("/api/catalog/trees/{treeId}/media-submission-permission", 42),
                collaboratorAuthentication()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.treeId").value(42))
        .andExpect(jsonPath("$.actorUsuarioAppId").value(7));
  }
}
