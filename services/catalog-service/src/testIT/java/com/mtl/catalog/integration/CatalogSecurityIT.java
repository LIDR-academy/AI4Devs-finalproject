package com.mtl.catalog.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mtl.catalog.config.JwtDecoderConfigTest;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Verifica 401/403 con cuerpo RFC 9457 y el mismo {@link JwtDecoder} + conversor de roles que en
 * tiempo de ejecución (salvo el decoder sustituido en {@link JwtDecoderConfigTest}).
 *
 * <p>Incluye rutas taxonómicas ADMIN (HU-011 esc. 2): familias, géneros y CRUD de especies.
 */
@Tag("integration")
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(JwtDecoderConfigTest.class)
class CatalogSecurityIT {

  @Autowired private MockMvc mockMvc;

  @Test
  void species_sinBearer_devuelve401ProblemJson() throws Exception {
    mockMvc
        .perform(get("/api/catalog/species").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
        .andExpect(jsonPath("$.title").value("No autenticado"));
  }

  @Test
  void species_bearerInvalido_devuelve401() throws Exception {
    mockMvc
        .perform(
            get("/api/catalog/species")
                .header(HttpHeaders.AUTHORIZATION, "Bearer token-inexistente")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void species_rolIncorrecto_devuelve403ProblemJson() throws Exception {
    mockMvc
        .perform(
            get("/api/catalog/species")
                .header(
                    HttpHeaders.AUTHORIZATION,
                    "Bearer " + JwtDecoderConfigTest.TOKEN_ROL_NO_AUTORIZADO)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
        .andExpect(jsonPath("$.title").value("Prohibido"));
  }

  @Test
  void species_colaborador_postSpecies_devuelve403() throws Exception {
    mockMvc
        .perform(
            post("/api/catalog/species")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + JwtDecoderConfigTest.TOKEN_COLABORADOR)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"genusId\":1,\"scientificName\":\"Quercus ilex\"}")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
        .andExpect(jsonPath("$.title").value("Prohibido"));
  }

  @Test
  void deleteSpecies_colaborador_devuelve403ProblemJson() throws Exception {
    mockMvc
        .perform(
            delete("/api/catalog/species/1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + JwtDecoderConfigTest.TOKEN_COLABORADOR)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.status").value(403));
  }

  @Test
  void postFamilies_sinBearer_devuelve401ProblemJson() throws Exception {
    mockMvc
        .perform(
            post("/api/catalog/families")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"scientificName\":\"Pinaceae\"}"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.title").value("No autenticado"));
  }

  @Test
  void getFamilies_colaborador_devuelve403ProblemJson() throws Exception {
    mockMvc
        .perform(
            get("/api/catalog/families")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + JwtDecoderConfigTest.TOKEN_COLABORADOR)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.title").value("Prohibido"));
  }

  @Test
  void postFamilies_colaborador_devuelve403ProblemJson() throws Exception {
    mockMvc
        .perform(
            post("/api/catalog/families")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + JwtDecoderConfigTest.TOKEN_COLABORADOR)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"scientificName\":\"Pinaceae\"}")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.status").value(403));
  }

  @Test
  void getSpeciesById_colaborador_devuelve403ProblemJson() throws Exception {
    mockMvc
        .perform(
            get("/api/catalog/species/1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + JwtDecoderConfigTest.TOKEN_COLABORADOR)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.title").value("Prohibido"));
  }

  @Test
  void getGenera_colaborador_devuelve403ProblemJson() throws Exception {
    mockMvc
        .perform(
            get("/api/catalog/genera")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + JwtDecoderConfigTest.TOKEN_COLABORADOR)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.status").value(403));
  }

  @Test
  void postGenera_colaborador_devuelve403ProblemJson() throws Exception {
    mockMvc
        .perform(
            post("/api/catalog/genera")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + JwtDecoderConfigTest.TOKEN_COLABORADOR)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"familyId\":1,\"scientificName\":\"Pinus\"}")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.title").value("Prohibido"))
        .andExpect(jsonPath("$.status").value(403));
  }

  @Test
  void putSpecies_colaborador_devuelve403ProblemJson() throws Exception {
    mockMvc
        .perform(
            put("/api/catalog/species/1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + JwtDecoderConfigTest.TOKEN_COLABORADOR)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"genusId\":1,\"scientificName\":\"Quercus ilex\"}")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.title").value("Prohibido"))
        .andExpect(jsonPath("$.status").value(403));
  }
}
