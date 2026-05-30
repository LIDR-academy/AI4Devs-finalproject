package com.mtl.catalog.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mtl.catalog.application.MasterDataQueryService;
import com.mtl.catalog.application.TaxonomyAdminService;
import com.mtl.catalog.config.CatalogSecurityConfig;
import com.mtl.catalog.dto.CreateTaxonomySpeciesRequest;
import com.mtl.catalog.dto.MasterDataPageResponse;
import com.mtl.catalog.dto.SpeciesListItemDto;
import com.mtl.catalog.dto.TaxonomySpeciesResponse;
import com.mtl.catalog.exception.CatalogConflictException;
import com.mtl.catalog.web.error.CatalogExceptionHandler;
import com.mtl.catalog.web.error.ProblemAccessDeniedHandler;
import com.mtl.catalog.web.error.ProblemAuthenticationEntryPoint;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

@WebMvcTest(controllers = CatalogSpeciesController.class)
@Import({
  CatalogSecurityConfig.class,
  CatalogExceptionHandler.class,
  ProblemAuthenticationEntryPoint.class,
  ProblemAccessDeniedHandler.class,
  CatalogSpeciesControllerWebMvcTest.JsonMapperWebMvcTestConfigurationTest.class
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CatalogSpeciesControllerWebMvcTest {

  @TestConfiguration
  static class JsonMapperWebMvcTestConfigurationTest {
    @Bean
    JsonMapper catalogSpeciesWebMvcTestJsonMapper() {
      return JsonMapper.builder().build();
    }
  }

  private static final String ISSUER = "http://localhost:8180/realms/mtl";

  @Autowired private MockMvc mockMvc;

  @MockitoBean private JwtDecoder jwtDecoder;

  @MockitoBean private MasterDataQueryService masterDataQueryService;

  @MockitoBean private TaxonomyAdminService taxonomyAdminService;

  private static Jwt jwtWithRealmRoles(String subject, List<String> roles) {
    Instant now = Instant.now();
    return Jwt.withTokenValue("mtl-test-" + subject)
        .header("alg", "none")
        .issuer(ISSUER)
        .issuedAt(now)
        .expiresAt(now.plusSeconds(3600))
        .subject(subject)
        .claim("realm_access", Map.of("roles", roles))
        .claim("email", subject + "@test.invalid")
        .build();
  }

  @Test
  void listSpecies_devuelveJsonPaginado() throws Exception {
    when(jwtDecoder.decode(any())).thenReturn(jwtWithRealmRoles("colab-list", List.of("COLABORADOR")));
    when(masterDataQueryService.listSpecies(eq(0), eq(20), eq("cina"), eq(false)))
        .thenReturn(
            MasterDataPageResponse.of(
                List.of(new SpeciesListItemDto(1L, "Encina (Quercus ilex)")),
                1,
                0,
                20,
                false));

    mockMvc
        .perform(
            get("/api/catalog/species")
                .header(HttpHeaders.AUTHORIZATION, "Bearer colab-list-token")
                .param("q", "cina")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].id").value(1))
        .andExpect(jsonPath("$.content[0].label").value("Encina (Quercus ilex)"))
        .andExpect(jsonPath("$.unpaged").value(false));
  }

  @Test
  void listSpecies_pageInvalido_devuelve400ProblemJson() throws Exception {
    when(jwtDecoder.decode(any())).thenReturn(jwtWithRealmRoles("colab-bad", List.of("COLABORADOR")));

    mockMvc
        .perform(
            get("/api/catalog/species")
                .header(HttpHeaders.AUTHORIZATION, "Bearer colab-bad-token")
                .param("page", "-1"))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
        .andExpect(jsonPath("$.title").value("Petición inválida"));
  }

  @Test
  void listSpecies_unpaged_llamaServicio() throws Exception {
    when(jwtDecoder.decode(any())).thenReturn(jwtWithRealmRoles("admin-unpaged", List.of("ADMIN")));
    when(masterDataQueryService.listSpecies(eq(0), eq(20), isNull(), eq(true)))
        .thenReturn(MasterDataPageResponse.of(List.of(), 0, 0, 0, true));

    mockMvc
        .perform(
            get("/api/catalog/species")
                .header(HttpHeaders.AUTHORIZATION, "Bearer admin-unpaged-token")
                .param("unpaged", "true"))
        .andExpect(status().isOk());
  }

  @Test
  void postSpecies_conAdmin_devuelve201ConLocation() throws Exception {
    when(jwtDecoder.decode(any())).thenReturn(jwtWithRealmRoles("admin-sp", List.of("ADMIN")));
    when(taxonomyAdminService.createSpecies(any(CreateTaxonomySpeciesRequest.class), any(Jwt.class)))
        .thenReturn(new TaxonomySpeciesResponse(42L, 3L, "Quercus ilex", "Encina", "Encina (Quercus ilex)"));

    mockMvc
        .perform(
            post("/api/catalog/species")
                .header(HttpHeaders.AUTHORIZATION, "Bearer admin-sp-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"genusId\":3,\"scientificName\":\"Quercus ilex\",\"commonName\":\"Encina\"}"))
        .andExpect(status().isCreated())
        .andExpect(header().exists("Location"))
        .andExpect(jsonPath("$.speciesId").value(42));
  }

  @Test
  void deleteSpecies_conAdmin_yConflictoFk_devuelve409() throws Exception {
    when(jwtDecoder.decode(any())).thenReturn(jwtWithRealmRoles("admin-del", List.of("ADMIN")));
    doThrow(
            new CatalogConflictException(
                "No se puede eliminar la especie porque existen fichas de árbol que la referencian."))
        .when(taxonomyAdminService)
        .deleteSpecies(eq(42L), any(Jwt.class));

    mockMvc
        .perform(
            delete("/api/catalog/species/42")
                .header(HttpHeaders.AUTHORIZATION, "Bearer admin-del-token")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.title").value("Conflicto"))
        .andExpect(jsonPath("$.status").value(409));
  }

  @Test
  void deleteSpecies_conColaborador_devuelve403() throws Exception {
    when(jwtDecoder.decode(any())).thenReturn(jwtWithRealmRoles("colab-del", List.of("COLABORADOR")));

    mockMvc
        .perform(
            delete("/api/catalog/species/5")
                .header(HttpHeaders.AUTHORIZATION, "Bearer colab-del-token")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.status").value(403));
  }
}
