package com.mtl.catalog.application;

/**
 * Borrado de enriquecimientos Mongo al eliminar un árbol (TASK-HU-015-01). Implementación real
 * pendiente de la capa Mongo en catalog-service.
 */
public interface TreeEnrichmentDeletionPort {

  void deleteEnrichmentForTree(long treeId);
}
