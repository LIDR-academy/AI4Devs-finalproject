package com.mtl.notification.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.mtl.notification.dto.CatalogArbolEventoPayload;
import com.mtl.notification.infrastructure.persistence.jpa.repository.EventoCatalogoRepository;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Import(CatalogArbolEventoConsumoService.class)
class CatalogArbolEventoConsumoIntegrationTest {

  @MockitoBean private CatalogArbolEventoProcesador procesador;

  @Autowired private EventoCatalogoRepository eventoCatalogoRepository;
  @Autowired private CatalogArbolEventoConsumoService consumoService;

  @Test
  void segundaLlamadaMismoEvento_idempotenteUnSoloProcesador() {
    var payload =
        new CatalogArbolEventoPayload(
            502L,
            "ARBOL_CREADO",
            11L,
            Instant.parse("2026-05-10T15:00:00Z"),
            "1.0",
            "Alta de ficha");
    consumoService.registrarYProcesarSiPrimero(payload);
    consumoService.registrarYProcesarSiPrimero(payload);
    verify(procesador, times(1)).procesarArbolCreado(payload);
    assertThat(eventoCatalogoRepository.count()).isEqualTo(1);
    assertThat(eventoCatalogoRepository.existsById(502L)).isTrue();
  }
}
