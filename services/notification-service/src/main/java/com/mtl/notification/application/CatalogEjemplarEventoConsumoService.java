package com.mtl.notification.application;

import com.mtl.notification.domain.EventoCatalogo;
import com.mtl.notification.dto.CatalogEjemplarEventoPayload;
import com.mtl.notification.infrastructure.persistence.jpa.repository.EventoCatalogoRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Registra el evento consumido en {@code evento_catalogo} (idempotencia por {@code evento_id}) y
 * solo entonces delega al procesador (HU-007-03). Reentregas Kafka: segunda entrega hace no-op.
 */
@Service
public class CatalogEjemplarEventoConsumoService {

  private static final Logger log = LoggerFactory.getLogger(CatalogEjemplarEventoConsumoService.class);

  /** Fila insertada; el pipeline posterior (correo) puede avanzar el estado en HU-007-04. */
  public static final String ESTADO_RECIBIDO = "RECIBIDO";

  /** Tras procesar notificación y envíos (HU-007-04). */
  public static final String ESTADO_PROCESADO = "PROCESADO";

  private final EventoCatalogoRepository eventoCatalogoRepository;
  private final CatalogEjemplarEventoProcesador procesador;

  public CatalogEjemplarEventoConsumoService(
      EventoCatalogoRepository eventoCatalogoRepository, CatalogEjemplarEventoProcesador procesador) {
    this.eventoCatalogoRepository = eventoCatalogoRepository;
    this.procesador = procesador;
  }

  @Transactional
  public void registrarYProcesarSiPrimero(CatalogEjemplarEventoPayload payload) {
    Long eventoId = payload.eventoId();
    if (eventoCatalogoRepository.existsById(eventoId)) {
      log.debug("evento_id={} ya en evento_catalogo (no-op idempotente, reentrega Kafka)", eventoId);
      return;
    }
    EventoCatalogo row = new EventoCatalogo();
    row.setEventoId(eventoId);
    row.setTipoEvento(payload.tipoEvento().trim());
    row.setEjemplarId(payload.ejemplarId());
    row.setEstadoProcesamiento(ESTADO_RECIBIDO);
    row.setRecibidoEn(OffsetDateTime.now(ZoneOffset.UTC));
    row.setCargaEventoJson(null);
    eventoCatalogoRepository.saveAndFlush(row);
    procesador.procesarEjemplarCreado(payload);
  }
}
