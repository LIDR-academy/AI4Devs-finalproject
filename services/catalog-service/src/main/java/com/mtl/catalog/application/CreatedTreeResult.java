package com.mtl.catalog.application;

import java.time.Instant;

/**
 * Resultado del caso de uso de creación: identificador del árbol y del actor en {@code usuario_app}
 * para auditoría y respuesta HTTP 201; instante de creación persistido para eventos de dominio.
 */
public record CreatedTreeResult(long arbolId, long actorUsuarioAppId, Instant ocurridoEn) {}
