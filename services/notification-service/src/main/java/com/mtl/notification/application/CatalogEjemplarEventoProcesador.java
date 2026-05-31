package com.mtl.notification.application;

import com.mtl.notification.dto.CatalogEjemplarEventoPayload;

/** Paso posterior al filtro {@code EJEMPLAR_CREADO} (idempotencia y correo en HU-007-03/04). */
public interface CatalogEjemplarEventoProcesador {

  void procesarEjemplarCreado(CatalogEjemplarEventoPayload payload);
}
