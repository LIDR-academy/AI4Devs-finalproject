package com.mtl.catalog.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mtl.catalog.config.JwtDecoderConfigTest;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * HU-011 esc. 3: DELETE de especie referenciada por {@code ejemplar} → **409** y la fila persiste.
 *
 * <p>Postgres real (Flyway + semilla); sin Kafka (publicador no-op).
 */
@Tag("integration")
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test-it-pg-kafka")
@Import(JwtDecoderConfigTest.class)
@EnabledIf("com.mtl.catalog.integration.support.DockerConditions#dockerDisponible")
class TaxonomyAdminDeleteConflictIT {

  /** Primera especie sembrada; ver {@code V2__seed_maestros_inicial.sql}. */
  private static final long SPECIES_ID = 1L;

  private static final long PROVINCE_ID = 1L;

  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:16-alpine").withInitScript("postgres-init-test.sql");

  @DynamicPropertySource
  static void registerProps(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
    registry.add("spring.datasource.username", POSTGRES::getUsername);
    registry.add("spring.datasource.password", POSTGRES::getPassword);
    registry.add("mtl.catalog.kafka.enabled", () -> "false");
    registry.add("spring.main.web-application-type", () -> "servlet");
  }

  @Autowired private MockMvc mockMvc;

  @Test
  void deleteSpecies_conEjemplarReferenciado_devuelve409_yConservaEspecie() throws Exception {
    String treeBody =
        """
        {
          "speciesId": %d,
          "provinceId": %d,
          "latitude": 40.4168,
          "longitude": -3.7038,
          "municipio": "Madrid",
          "description": "IT HU-011 esc. 3",
          "altitude": 600,
          "publicMapVisibility": "PUBLICO",
          "publicationState": "PUBLICADO"
        }
        """
            .formatted(SPECIES_ID, PROVINCE_ID);

    mockMvc
        .perform(
            post("/api/catalog/trees")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + JwtDecoderConfigTest.TOKEN_COLABORADOR)
                .content(treeBody))
        .andExpect(status().isCreated());

    mockMvc
        .perform(
            delete("/api/catalog/species/" + SPECIES_ID)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + JwtDecoderConfigTest.TOKEN_ADMIN)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.title").value("Conflicto"))
        .andExpect(jsonPath("$.status").value(409));

    mockMvc
        .perform(
            get("/api/catalog/species/" + SPECIES_ID)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + JwtDecoderConfigTest.TOKEN_ADMIN)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.speciesId").value((int) SPECIES_ID));
  }
}
