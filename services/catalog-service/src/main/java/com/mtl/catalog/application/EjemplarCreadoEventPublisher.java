package com.mtl.catalog.application;

import java.time.OffsetDateTime;

/** Publica el hecho de dominio de alta de árbol hacia Kafka (o no-op si Kafka está desactivado). */
public interface EjemplarCreadoEventPublisher {

  void publishEjemplarCreado(long ejemplarId, OffsetDateTime ocurridoEn);
}
