package com.mtl.catalog.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.mtl.catalog.dto.SpeciesListItemDto;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EspecieReadRepository;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Valida búsqueda con {@code unaccent} + {@code strpos} en PostgreSQL (mismo criterio que en dev).
 * Requiere Docker. Slice JPA sin OAuth2 (no hace falta JwtDecoder para el repositorio).
 * Inyección por campo: con {@code @Testcontainers} en la clase, el constructor con beans Spring
 * puede resolverse mal como parámetros JUnit.
 */
@Tag("integration")
@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test-pg")
@EnabledIf("com.mtl.catalog.integration.support.DockerConditions#dockerDisponible")
class EspecieReadRepositoryNativeQueryIT {

  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:16-alpine").withInitScript("postgres-init-test.sql");

  @DynamicPropertySource
  static void datasource(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
    registry.add("spring.datasource.username", POSTGRES::getUsername);
    registry.add("spring.datasource.password", POSTGRES::getPassword);
  }

  @Autowired private EspecieReadRepository especieReadRepository;

  @Test
  void busquedaPorPatronComun_sinAcentos_encuentraEncina() {
    Page<SpeciesListItemDto> page =
        especieReadRepository.search("cina", PageRequest.of(0, 20));
    assertThat(page.getContent())
        .anyMatch(
            row ->
                row.label().contains("Encina")
                    && row.label().contains("Quercus ilex"));
  }

  @Test
  void busquedaPorPatronCientifico_caseInsensitive_encuentraQuercus() {
    Page<SpeciesListItemDto> page =
        especieReadRepository.search("quercus", PageRequest.of(0, 5));
    assertThat(page.getContent()).isNotEmpty();
    assertThat(page.getContent().getFirst().label().toLowerCase()).contains("quercus");
  }
}
