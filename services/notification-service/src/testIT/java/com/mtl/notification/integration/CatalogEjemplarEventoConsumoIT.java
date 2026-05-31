package com.mtl.notification.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.mtl.notification.application.CatalogEjemplarEventoConsumoService;
import com.mtl.notification.application.CatalogEjemplarEventoProcesador;
import com.mtl.notification.dto.CatalogEjemplarEventoPayload;
import com.mtl.notification.infrastructure.persistence.jpa.repository.EventoCatalogoRepository;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** Idempotencia de consumo con esquema Flyway/PostgreSQL real. Requiere Docker. */
@Tag("integration")
@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test-pg")
@Import(CatalogEjemplarEventoConsumoService.class)
@EnabledIf("com.mtl.notification.integration.support.DockerConditions#dockerDisponible")
class CatalogEjemplarEventoConsumoIT {

  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:16-alpine")
          .withInitScript("postgres-init-notification-test.sql");

  @DynamicPropertySource
  static void datasource(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
    registry.add("spring.datasource.username", POSTGRES::getUsername);
    registry.add("spring.datasource.password", POSTGRES::getPassword);
  }

  @MockitoBean private CatalogEjemplarEventoProcesador procesador;

  @Autowired private EventoCatalogoRepository eventoCatalogoRepository;
  @Autowired private CatalogEjemplarEventoConsumoService consumoService;

  @Test
  void segundaLlamadaMismoEvento_idempotenteUnSoloProcesador() {
    var payload =
        new CatalogEjemplarEventoPayload(
            502L,
            "EJEMPLAR_CREADO",
            11L,
            OffsetDateTime.parse("2026-05-10T15:00:00Z"),
            "1.0",
            "Alta de ficha");
    consumoService.registrarYProcesarSiPrimero(payload);
    consumoService.registrarYProcesarSiPrimero(payload);
    verify(procesador, times(1)).procesarEjemplarCreado(payload);
    assertThat(eventoCatalogoRepository.count()).isEqualTo(1);
    assertThat(eventoCatalogoRepository.existsById(502L)).isTrue();
  }
}
