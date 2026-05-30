package com.mtl.notification.application;

import com.mtl.notification.dto.CatalogEjemplarEventoPayload;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class CatalogEjemplarEventoIngestionService {

  private static final Logger log = LoggerFactory.getLogger(CatalogEjemplarEventoIngestionService.class);

  private final CatalogEjemplarEventoPayloadParser parser;
  private final CatalogEjemplarEventoConsumoService consumoService;

  public CatalogEjemplarEventoIngestionService(
      CatalogEjemplarEventoPayloadParser parser, CatalogEjemplarEventoConsumoService consumoService) {
    this.parser = parser;
    this.consumoService = consumoService;
  }

  /**
   * Entrada desde Kafka (valor UTF-8 JSON). No registra el cuerpo completo (evitar PII o ruido);
   * solo longitud ante fallo de parseo.
   */
  public void onKafkaValue(String payload) {
    Optional<CatalogEjemplarEventoPayload> parsed = parser.parse(payload);
    if (parsed.isEmpty()) {
      log.warn(
          "Mensaje catalog.ejemplar.evento ignorado: JSON inválido o sin campos mínimos (longitud={})",
          payloadLength(payload));
      return;
    }
    CatalogEjemplarEventoPayload evento = parsed.get();
    if (!evento.esEjemplarCreado()) {
      log.debug(
          "tipo_evento={} omitido (solo EJEMPLAR_CREADO dispara notificación en MVP)",
          evento.tipoEvento());
      return;
    }
    consumoService.registrarYProcesarSiPrimero(evento);
  }

  private static int payloadLength(String payload) {
    return payload == null ? 0 : Math.min(payload.length(), 8192);
  }
}
