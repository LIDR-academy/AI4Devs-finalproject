package com.mtl.notification.application;

import com.mtl.notification.dto.CatalogArbolEventoPayload;

/** Paso posterior al filtro {@code ARBOL_CREADO} (idempotencia y correo en HU-007-03/04). */
public interface CatalogArbolEventoProcesador {

  void procesarArbolCreado(CatalogArbolEventoPayload payload);
}
