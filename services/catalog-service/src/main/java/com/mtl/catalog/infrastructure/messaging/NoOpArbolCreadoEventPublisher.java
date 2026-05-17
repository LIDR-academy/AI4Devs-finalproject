package com.mtl.catalog.infrastructure.messaging;

import com.mtl.catalog.application.ArbolCreadoEventPublisher;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(
    name = "mtl.catalog.kafka.enabled",
    havingValue = "false",
    matchIfMissing = true)
public class NoOpArbolCreadoEventPublisher implements ArbolCreadoEventPublisher {

  private static final Logger log = LoggerFactory.getLogger(NoOpArbolCreadoEventPublisher.class);

  @Override
  public void publishArbolCreado(long arbolId, Instant ocurridoEn) {
    log.debug("Kafka desactivado: omitiendo publicación ARBOL_CREADO (arbolId={})", arbolId);
  }
}
