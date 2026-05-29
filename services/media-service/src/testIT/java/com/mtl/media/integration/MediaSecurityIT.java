package com.mtl.media.integration;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mtl.media.config.MediaJwtDecoderConfigTest;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Verifica 401/403 con cuerpo RFC 9457 y el mismo {@link org.springframework.security.oauth2.jwt.JwtDecoder}
 * + conversor de roles que en tiempo de ejecución (salvo el decoder sustituido en
 * {@link MediaJwtDecoderConfigTest}), y que las rutas públicas no exigen token.
 */
@Tag("integration")
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(MediaJwtDecoderConfigTest.class)
class MediaSecurityIT {

  @Autowired private MockMvc mockMvc;

  @Test
  void presign_sinBearer_devuelve401ProblemJson() throws Exception {
    mockMvc
        .perform(
            post("/api/media/uploads/presign")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
        .andExpect(jsonPath("$.title").value("No autenticado"));
  }

  @Test
  void presign_bearerInvalido_devuelve401() throws Exception {
    mockMvc
        .perform(
            post("/api/media/uploads/presign")
                .header(HttpHeaders.AUTHORIZATION, "Bearer token-inexistente")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void presign_rolIncorrecto_devuelve403ProblemJson() throws Exception {
    mockMvc
        .perform(
            post("/api/media/uploads/presign")
                .header(
                    HttpHeaders.AUTHORIZATION,
                    "Bearer " + MediaJwtDecoderConfigTest.TOKEN_ROL_NO_AUTORIZADO)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
        .andExpect(jsonPath("$.title").value("Prohibido"));
  }

  @Test
  void primaryPhotoPublica_sinBearer_noExige401() throws Exception {
    mockMvc
        .perform(get("/api/media/public/ejemplares/999/primary-photo").accept(MediaType.APPLICATION_JSON))
        .andExpect(
            result ->
                assertNotEquals(
                    HttpStatus.UNAUTHORIZED.value(),
                    result.getResponse().getStatus(),
                    "ruta pública no debe exigir JWT (código aguas abajo puede ser 404)"));
  }

  @Test
  void galeriaPublicaDetalle_sinBearer_noExige401() throws Exception {
    mockMvc
        .perform(get("/api/media/ejemplares/999/photos").accept(MediaType.APPLICATION_JSON))
        .andExpect(
            result ->
                assertNotEquals(
                    HttpStatus.UNAUTHORIZED.value(),
                    result.getResponse().getStatus(),
                    "galería de detalle en consulta no debe exigir JWT"));
  }
}
