package com.mtl.notification.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.notification.domain.EnvioNotificacion;
import com.mtl.notification.domain.EstadoSuscripcion;
import com.mtl.notification.domain.EventoCatalogo;
import com.mtl.notification.domain.Notificacion;
import com.mtl.notification.domain.Suscriptor;
import com.mtl.notification.dto.CatalogArbolEventoPayload;
import com.mtl.notification.infrastructure.persistence.jpa.repository.EnvioNotificacionRepository;
import com.mtl.notification.infrastructure.persistence.jpa.repository.EventoCatalogoRepository;
import com.mtl.notification.infrastructure.persistence.jpa.repository.NotificacionRepository;
import com.mtl.notification.infrastructure.persistence.jpa.repository.SuscriptorRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NotificacionCatalogArbolEventoProcesadorTest {

  @Mock private EventoCatalogoRepository eventoCatalogoRepository;
  @Mock private NotificacionRepository notificacionRepository;
  @Mock private EnvioNotificacionRepository envioNotificacionRepository;
  @Mock private SuscriptorRepository suscriptorRepository;
  @Mock private ArbolCreadoCorreoAvisoSender correoAvisoSender;

  @Captor private ArgumentCaptor<Notificacion> notificacionCaptor;
  @Captor private ArgumentCaptor<List<EnvioNotificacion>> enviosCaptor;

  private NotificacionCatalogArbolEventoProcesador procesador;

  private final CatalogArbolEventoPayload payload =
      new CatalogArbolEventoPayload(
          200L,
          "ARBOL_CREADO",
          42L,
          Instant.parse("2026-05-10T16:00:00Z"),
          "1.0",
          "Alta");

  @BeforeEach
  void setUp() {
    procesador =
        new NotificacionCatalogArbolEventoProcesador(
            eventoCatalogoRepository,
            notificacionRepository,
            envioNotificacionRepository,
            suscriptorRepository,
            correoAvisoSender);
  }

  @Test
  void sinSuscriptoresActivos_persisteNotificacionSinEnviosNiCorreo() {
    EventoCatalogo evento = new EventoCatalogo();
    evento.setEventoId(200L);
    when(eventoCatalogoRepository.findById(200L)).thenReturn(Optional.of(evento));
    when(suscriptorRepository.findAllByEstadoSuscripcionOrderByIdAsc(EstadoSuscripcion.ACTIVA))
        .thenReturn(List.of());

    procesador.procesarArbolCreado(payload);

    verify(notificacionRepository).save(notificacionCaptor.capture());
    assertThat(notificacionCaptor.getValue().getEstadoGeneracion())
        .isEqualTo(NotificacionCatalogArbolEventoProcesador.ESTADO_GENERACION_SIN_DESTINATARIOS);
    verify(envioNotificacionRepository, never()).saveAll(any());
    verify(correoAvisoSender, never()).intentarEnviar(any(), anyLong(), anyLong());
    verify(eventoCatalogoRepository).save(evento);
    assertThat(evento.getEstadoProcesamiento()).isEqualTo(CatalogArbolEventoConsumoService.ESTADO_PROCESADO);
    assertThat(evento.getProcesadoEn()).isNotNull();
  }

  @Test
  void conDosSuscriptores_enviaCorreoYMarcaEstados() {
    EventoCatalogo evento = new EventoCatalogo();
    evento.setEventoId(200L);
    when(eventoCatalogoRepository.findById(200L)).thenReturn(Optional.of(evento));

    Suscriptor s1 = new Suscriptor();
    s1.setId(10L);
    s1.setEmail("a@example.test");
    Suscriptor s2 = new Suscriptor();
    s2.setId(11L);
    s2.setEmail("b@example.test");
    when(suscriptorRepository.findAllByEstadoSuscripcionOrderByIdAsc(EstadoSuscripcion.ACTIVA))
        .thenReturn(List.of(s1, s2));

    when(correoAvisoSender.intentarEnviar(eq("a@example.test"), eq(42L), eq(200L))).thenReturn(true);
    when(correoAvisoSender.intentarEnviar(eq("b@example.test"), eq(42L), eq(200L))).thenReturn(false);

    procesador.procesarArbolCreado(payload);

    verify(correoAvisoSender, times(1)).intentarEnviar("a@example.test", 42L, 200L);
    verify(correoAvisoSender, times(1)).intentarEnviar("b@example.test", 42L, 200L);

    verify(envioNotificacionRepository, times(2)).saveAll(enviosCaptor.capture());
    // Misma lista mutada entre la primera y la segunda llamada; getValue() devuelve el último argumento capturado.
    List<EnvioNotificacion> finales = enviosCaptor.getValue();
    assertThat(finales).hasSize(2);
    EnvioNotificacion eA =
        finales.stream().filter(e -> e.getSuscriptor().getId().equals(10L)).findFirst().orElseThrow();
    EnvioNotificacion eB =
        finales.stream().filter(e -> e.getSuscriptor().getId().equals(11L)).findFirst().orElseThrow();
    assertThat(eA.getEstadoEnvio()).isEqualTo(NotificacionCatalogArbolEventoProcesador.ESTADO_ENVIO_ENVIADA);
    assertThat(eA.getEnviadaEn()).isNotNull();
    assertThat(eB.getEstadoEnvio()).isEqualTo(NotificacionCatalogArbolEventoProcesador.ESTADO_ENVIO_ERROR);
    assertThat(eB.getMensajeError()).isNotBlank();

    verify(eventoCatalogoRepository).save(evento);
  }
}
