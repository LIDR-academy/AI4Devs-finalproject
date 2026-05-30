package com.mtl.catalog.infrastructure.messaging;

import com.mtl.catalog.application.EjemplarCreadoEventPublisher;
import java.time.OffsetDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(
    name = "mtl.catalog.kafka.enabled",
    havingValue = "false",
    matchIfMissing = true)
public class NoOpEjemplarCreadoEventPublisher implements EjemplarCreadoEventPublisher {

  private static final Logger log = LoggerFactory.getLogger(NoOpEjemplarCreadoEventPublisher.class);

  @Override
  public void publishEjemplarCreado(long ejemplarId, OffsetDateTime ocurridoEn) {
    log.debug("Kafka desactivado: omitiendo publicación EJEMPLAR_CREADO (ejemplarId={})", ejemplarId);
  }
}
