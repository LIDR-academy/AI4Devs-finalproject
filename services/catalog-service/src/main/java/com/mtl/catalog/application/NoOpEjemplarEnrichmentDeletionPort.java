package com.mtl.catalog.application;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** Stub TASK-HU-015-01 hasta existir proyección Mongo en catalog-service. */
@Component
public class NoOpEjemplarEnrichmentDeletionPort implements EjemplarEnrichmentDeletionPort {

  private static final Logger log = LoggerFactory.getLogger(NoOpEjemplarEnrichmentDeletionPort.class);

  @Override
  public void deleteEnrichmentForEjemplar(long ejemplarId) {
    log.debug("Mongo no configurado: omitiendo borrado de enriquecimiento (ejemplarId={})", ejemplarId);
  }
}
