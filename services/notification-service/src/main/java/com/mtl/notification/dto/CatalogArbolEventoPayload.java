package com.mtl.notification.dto;

import java.time.Instant;

/**
 * Cuerpo JSON de {@code catalog.arbol.evento} (productor catalog-service, {@code
 * docs/events/kafka-events.md}). Solo campos necesarios para el consumidor MVP.
 */
public record CatalogArbolEventoPayload(
    Long eventoId,
    String tipoEvento,
    Long arbolId,
    Instant ocurridoEn,
    String schemaVersion,
    String resumenCambio) {

  public static final String TIPO_ARBOL_CREADO = "ARBOL_CREADO";

  public boolean esArbolCreado() {
    return tipoEvento != null && TIPO_ARBOL_CREADO.equals(tipoEvento.trim());
  }
}
