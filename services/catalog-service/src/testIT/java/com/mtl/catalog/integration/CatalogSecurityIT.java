package com.mtl.catalog.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mtl.catalog.config.JwtDecoderConfigTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Verifica 401/403 con cuerpo RFC 9457 y el mismo {@link JwtDecoder} + conversor de roles que en
 * tiempo de ejecución (salvo el decoder sustituido en {@link JwtDecoderConfigTest}).
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
}
