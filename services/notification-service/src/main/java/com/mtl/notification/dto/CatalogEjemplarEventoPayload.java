package com.mtl.notification.dto;

import java.time.OffsetDateTime;

/**
 * Cuerpo JSON de {@code catalog.ejemplar.evento} (productor catalog-service, {@code
 * docs/events/kafka-events.md}). Solo campos necesarios para el consumidor MVP.
 */
public record CatalogEjemplarEventoPayload(
    Long eventoId,
    String tipoEvento,
    Long ejemplarId,
    OffsetDateTime ocurridoEn,
    String schemaVersion,
    String resumenCambio) {

  public static final String TIPO_EJEMPLAR_CREADO = "EJEMPLAR_CREADO";

  public boolean esEjemplarCreado() {
    return tipoEvento != null && TIPO_EJEMPLAR_CREADO.equals(tipoEvento.trim());
  }
}
