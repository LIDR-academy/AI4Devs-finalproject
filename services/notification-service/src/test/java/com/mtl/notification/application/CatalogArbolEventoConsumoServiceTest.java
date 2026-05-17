package com.mtl.notification.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.notification.domain.EventoCatalogo;
import com.mtl.notification.dto.CatalogArbolEventoPayload;
import com.mtl.notification.infrastructure.persistence.jpa.repository.EventoCatalogoRepository;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CatalogArbolEventoConsumoServiceTest {

  @Mock private EventoCatalogoRepository eventoCatalogoRepository;
  @Mock private CatalogArbolEventoProcesador procesador;

  private CatalogArbolEventoConsumoService consumoService;

  private final CatalogArbolEventoPayload payload =
      new CatalogArbolEventoPayload(
          100L,
          "ARBOL_CREADO",
          7L,
          Instant.parse("2026-05-10T14:00:00Z"),
          "1.0",
          "Alta de ficha");

  @BeforeEach
  void setUp() {
    consumoService = new CatalogArbolEventoConsumoService(eventoCatalogoRepository, procesador);
  }

  @Test
  void siEventoYaExiste_noInsertaNiProcesa() {
    when(eventoCatalogoRepository.existsById(100L)).thenReturn(true);
    consumoService.registrarYProcesarSiPrimero(payload);
    verify(eventoCatalogoRepository, never()).saveAndFlush(any());
    verify(procesador, never()).procesarArbolCreado(any());
  }

  @Test
  void siEventoNuevo_insertaYProcesa() {
    when(eventoCatalogoRepository.existsById(100L)).thenReturn(false);
    consumoService.registrarYProcesarSiPrimero(payload);
    ArgumentCaptor<EventoCatalogo> captor = ArgumentCaptor.forClass(EventoCatalogo.class);
    verify(eventoCatalogoRepository).saveAndFlush(captor.capture());
    EventoCatalogo guardado = captor.getValue();
    assertThat(guardado.getEventoId()).isEqualTo(100L);
    assertThat(guardado.getArbolId()).isEqualTo(7L);
    assertThat(guardado.getTipoEvento()).isEqualTo("ARBOL_CREADO");
    assertThat(guardado.getEstadoProcesamiento()).isEqualTo(CatalogArbolEventoConsumoService.ESTADO_RECIBIDO);
    assertThat(guardado.getRecibidoEn()).isNotNull();
    verify(procesador).procesarArbolCreado(payload);
  }
}
