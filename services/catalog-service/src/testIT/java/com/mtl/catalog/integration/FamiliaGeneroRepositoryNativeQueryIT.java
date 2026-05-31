package com.mtl.catalog.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.mtl.catalog.dto.TaxonomyGenusListItemDto;
import com.mtl.catalog.dto.TaxonomyMasterListItemDto;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.FamiliaRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.GeneroRepository;
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
 * Valida búsqueda nativa con {@code unaccent} + {@code strpos} en familias y géneros (PostgreSQL).
 * Requiere Docker. Mismo perfil y contenedor que {@link EspecieReadRepositoryNativeQueryIT}.
 */
@Tag("integration")
@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test-pg")
@EnabledIf("com.mtl.catalog.integration.support.DockerConditions#dockerDisponible")
class FamiliaGeneroRepositoryNativeQueryIT {

  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:16-alpine").withInitScript("postgres-init-test.sql");

  @DynamicPropertySource
  static void datasource(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
    registry.add("spring.datasource.username", POSTGRES::getUsername);
    registry.add("spring.datasource.password", POSTGRES::getPassword);
  }

  @Autowired private FamiliaRepository familiaRepository;
  @Autowired private GeneroRepository generoRepository;

  @Test
  void busquedaFamiliaPorPatronComun_sinAcentos_encuentraFagaceas() {
    Page<TaxonomyMasterListItemDto> page =
        familiaRepository.search("fagaceas", PageRequest.of(0, 20));

    assertThat(page.getContent())
        .anyMatch(
            row ->
                row.label().contains("Fagáceas") && row.label().contains("Fagaceae"));
  }

  @Test
  void busquedaGeneroPorPatronCientifico_caseInsensitive_encuentraQuercus() {
    Page<TaxonomyGenusListItemDto> page =
        generoRepository.search(null, "quercus", PageRequest.of(0, 5));

    assertThat(page.getContent()).isNotEmpty();
    assertThat(page.getContent().getFirst().label().toLowerCase()).contains("quercus");
  }

  @Test
  void busquedaGenero_filtroPorFamilia_devuelveSoloGenerosDeEsaFamilia() {
    Page<TaxonomyMasterListItemDto> familias =
        familiaRepository.search("Fagaceae", PageRequest.of(0, 5));
    assertThat(familias.getContent()).isNotEmpty();
    long familiaId = familias.getContent().getFirst().id();

    Page<TaxonomyGenusListItemDto> generosFiltrados =
        generoRepository.search(familiaId, null, PageRequest.of(0, 50));

    assertThat(generosFiltrados.getContent()).isNotEmpty();
    assertThat(generosFiltrados.getContent()).allMatch(g -> g.familyId() == familiaId);
    assertThat(generosFiltrados.getContent())
        .anyMatch(g -> g.label().toLowerCase().contains("quercus"));
  }
}
