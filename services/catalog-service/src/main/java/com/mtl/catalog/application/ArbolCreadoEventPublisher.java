package com.mtl.catalog.application;

import java.time.Instant;

/** Publica el hecho de dominio de alta de árbol hacia Kafka (o no-op si Kafka está desactivado). */
public interface ArbolCreadoEventPublisher {

  void publishArbolCreado(long arbolId, Instant ocurridoEn);
}
