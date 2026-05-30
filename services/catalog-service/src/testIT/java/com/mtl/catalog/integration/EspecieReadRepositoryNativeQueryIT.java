package com.mtl.catalog.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.mtl.catalog.dto.SpeciesListItemDto;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EspecieReadRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EspecieRepository;
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
                    && row.label().contains("Quercus ilex")
                    && row.genusId() > 0
                    && row.genusLabel().contains("Quercus"));
  }

  @Test
  void busquedaPorPatronCientifico_caseInsensitive_encuentraQuercus() {
    Page<SpeciesListItemDto> page =
        especieReadRepository.search("quercus", PageRequest.of(0, 5));
    assertThat(page.getContent()).isNotEmpty();
    assertThat(page.getContent().getFirst().label().toLowerCase()).contains("quercus");
  }

  @Test
  void listadoSinFiltro_incluyeGenusIdYGenusLabelEnCadaFila() {
    Page<SpeciesListItemDto> page =
        especieReadRepository.search(null, PageRequest.of(0, EspecieRepository.MAX_UNPAGED));
    assertThat(page.getContent()).isNotEmpty();
    assertThat(page.getContent())
        .allMatch(row -> row.genusId() > 0 && row.genusLabel() != null && !row.genusLabel().isBlank());
  }

  @Test
  void listadoSinFiltro_ordenadoPorNombreComun_antesQueCientifico() {
    Page<SpeciesListItemDto> page =
        especieReadRepository.search(null, PageRequest.of(0, EspecieRepository.MAX_UNPAGED));
    var labels = page.getContent().stream().map(SpeciesListItemDto::label).toList();
    int coscoja =
        indexOfLabelContaining(labels, "Coscoja", "Quercus coccifera");
    int encina = indexOfLabelContaining(labels, "Encina", "Quercus ilex");
    assertThat(coscoja).isGreaterThanOrEqualTo(0);
    assertThat(encina).isGreaterThanOrEqualTo(0);
    assertThat(coscoja)
        .as("Coscoja (común) debe ir antes que Encina; si no, el ORDER BY sigue siendo solo científico")
        .isLessThan(encina);
  }

  private static int indexOfLabelContaining(
      java.util.List<String> labels, String commonFragment, String scientificFragment) {
    for (int i = 0; i < labels.size(); i++) {
      String label = labels.get(i);
      if (label.contains(commonFragment) && label.contains(scientificFragment)) {
        return i;
      }
    }
    return -1;
  }
}
