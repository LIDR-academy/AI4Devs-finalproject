package com.mtl.catalog.application;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** Stub TASK-HU-015-01 hasta existir proyección Mongo en catalog-service. */
@Component
public class NoOpTreeEnrichmentDeletionPort implements TreeEnrichmentDeletionPort {

  private static final Logger log = LoggerFactory.getLogger(NoOpTreeEnrichmentDeletionPort.class);

  @Override
  public void deleteEnrichmentForTree(long treeId) {
    log.debug("Mongo no configurado: omitiendo borrado de enriquecimiento (arbolId={})", treeId);
  }
}
