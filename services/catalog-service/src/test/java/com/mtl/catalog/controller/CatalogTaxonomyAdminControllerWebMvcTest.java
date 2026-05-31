package com.mtl.catalog.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mtl.catalog.application.MasterDataQueryService;
import com.mtl.catalog.application.TaxonomyAdminService;
import com.mtl.catalog.config.CatalogSecurityConfig;
import com.mtl.catalog.dto.CreateTaxonomyFamilyRequest;
import com.mtl.catalog.dto.MasterDataPageResponse;
import com.mtl.catalog.dto.TaxonomyFamilyResponse;
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

/**
 * Seguridad y respuestas Problem para rutas taxonómicas **ADMIN** — **TASK-HU-011-04**.
 */
@WebMvcTest(controllers = CatalogTaxonomyAdminController.class)
@Import({
  CatalogSecurityConfig.class,
  CatalogExceptionHandler.class,
  ProblemAuthenticationEntryPoint.class,
  ProblemAccessDeniedHandler.class,
  CatalogTaxonomyAdminControllerWebMvcTest.JsonMapperWebMvcTestConfigurationTest.class
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CatalogTaxonomyAdminControllerWebMvcTest {

  @TestConfiguration
  static class JsonMapperWebMvcTestConfigurationTest {
    @Bean
    JsonMapper catalogTaxonomyAdminWebMvcTestJsonMapper() {
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
  void postFamily_sinBearer_devuelve401() throws Exception {
    mockMvc
        .perform(
            post("/api/catalog/families")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"scientificName\":\"Fagaceae\"}"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.title").value("No autenticado"))
        .andExpect(jsonPath("$.status").value(401));
  }

  @Test
  void postFamily_conColaborador_devuelve403() throws Exception {
    when(jwtDecoder.decode(any())).thenReturn(jwtWithRealmRoles("colab-sub", List.of("COLABORADOR")));

    mockMvc
        .perform(
            post("/api/catalog/families")
                .header(HttpHeaders.AUTHORIZATION, "Bearer colab-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"scientificName\":\"Fagaceae\"}"))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.title").value("Prohibido"))
        .andExpect(jsonPath("$.status").value(403));
  }

  @Test
  void postFamily_conAdmin_devuelve201() throws Exception {
    when(jwtDecoder.decode(any())).thenReturn(jwtWithRealmRoles("admin-sub", List.of("ADMIN")));
    when(taxonomyAdminService.createFamily(any(CreateTaxonomyFamilyRequest.class), any(Jwt.class)))
        .thenReturn(new TaxonomyFamilyResponse(1L, "Fagaceae", null, "Fagaceae"));

    mockMvc
        .perform(
            post("/api/catalog/families")
                .header(HttpHeaders.AUTHORIZATION, "Bearer admin-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"scientificName\":\"Fagaceae\"}"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.familyId").value(1))
        .andExpect(jsonPath("$.scientificName").value("Fagaceae"));
  }

  @Test
  void getFamilies_conColaborador_devuelve403() throws Exception {
    when(jwtDecoder.decode(any())).thenReturn(jwtWithRealmRoles("colab-sub-2", List.of("COLABORADOR")));

    mockMvc
        .perform(
            get("/api/catalog/families")
                .header(HttpHeaders.AUTHORIZATION, "Bearer colab-token-2")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.status").value(403));
  }

  @Test
  void getFamilies_conAdmin_devuelve200() throws Exception {
    when(jwtDecoder.decode(any())).thenReturn(jwtWithRealmRoles("admin-sub-2", List.of("ADMIN")));
    when(masterDataQueryService.listFamilies(eq(0), eq(20), eq(null), eq(false)))
        .thenReturn(MasterDataPageResponse.of(List.of(), 0, 0, 20, false));

    mockMvc
        .perform(
            get("/api/catalog/families")
                .header(HttpHeaders.AUTHORIZATION, "Bearer admin-token-2")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content").isArray());
  }
}
