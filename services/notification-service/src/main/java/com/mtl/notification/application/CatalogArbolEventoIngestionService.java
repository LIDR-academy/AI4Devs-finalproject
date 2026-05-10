package com.mtl.notification.application;

import com.mtl.notification.dto.CatalogArbolEventoPayload;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class CatalogArbolEventoIngestionService {

  private static final Logger log = LoggerFactory.getLogger(CatalogArbolEventoIngestionService.class);

  private final CatalogArbolEventoPayloadParser parser;
  private final CatalogArbolEventoConsumoService consumoService;

  public CatalogArbolEventoIngestionService(
      CatalogArbolEventoPayloadParser parser, CatalogArbolEventoConsumoService consumoService) {
    this.parser = parser;
    this.consumoService = consumoService;
  }

  /**
   * Entrada desde Kafka (valor UTF-8 JSON). No registra el cuerpo completo (evitar PII o ruido);
   * solo longitud ante fallo de parseo.
   */
  public void onKafkaValue(String payload) {
    Optional<CatalogArbolEventoPayload> parsed = parser.parse(payload);
    if (parsed.isEmpty()) {
      log.warn(
          "Mensaje catalog.arbol.evento ignorado: JSON inválido o sin campos mínimos (longitud={})",
          payloadLength(payload));
      return;
    }
    CatalogArbolEventoPayload evento = parsed.get();
    if (!evento.esArbolCreado()) {
      log.debug(
          "tipo_evento={} omitido (solo ARBOL_CREADO dispara notificación en MVP)",
          evento.tipoEvento());
      return;
    }
    consumoService.registrarYProcesarSiPrimero(evento);
  }

  private static int payloadLength(String payload) {
    return payload == null ? 0 : Math.min(payload.length(), 8192);
  }
}
