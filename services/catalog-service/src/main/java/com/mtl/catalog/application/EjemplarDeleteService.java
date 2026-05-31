package com.mtl.catalog.application;

import com.mtl.catalog.domain.Ejemplar;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EjemplarRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EjemplarDeleteService {

  private final EjemplarRepository ejemplarRepository;
  private final EjemplarEnrichmentDeletionPort ejemplarEnrichmentDeletionPort;
  private final CatalogAuditService catalogAuditService;

  public EjemplarDeleteService(
      EjemplarRepository ejemplarRepository,
      EjemplarEnrichmentDeletionPort ejemplarEnrichmentDeletionPort,
      CatalogAuditService catalogAuditService) {
    this.ejemplarRepository = ejemplarRepository;
    this.ejemplarEnrichmentDeletionPort = ejemplarEnrichmentDeletionPort;
    this.catalogAuditService = catalogAuditService;
  }

  public EjemplarDeleteAuthorization authorize(long ejemplarId, long actorUsuarioAppId, boolean admin) {
    Ejemplar ejemplar =
        ejemplarRepository
            .findById(ejemplarId)
            .orElseThrow(
                () ->
                    new CatalogNotFoundException(
                        "No se encontró un árbol con el identificador indicado."));

    if (!admin && !ejemplar.getUsuarioAppId().equals(actorUsuarioAppId)) {
      throw new CatalogForbiddenException("No tiene permiso para eliminar esta ficha de árbol.");
    }

    return new EjemplarDeleteAuthorization(ejemplarId, ejemplar.getEspecieId(), ejemplar.getProvinciaId());
  }

  @Transactional
  public void commitPhysicalDelete(EjemplarDeleteAuthorization authorization, long actorUsuarioAppId) {
    if (!ejemplarRepository.existsById(authorization.treeId())) {
      throw new CatalogNotFoundException("No se encontró un árbol con el identificador indicado.");
    }
    ejemplarRepository.deleteById(authorization.treeId());
    ejemplarEnrichmentDeletionPort.deleteEnrichmentForEjemplar(authorization.treeId());
    catalogAuditService.recordEjemplarDeleted(
        actorUsuarioAppId,
        authorization.treeId(),
        authorization.especieId(),
        authorization.provinciaId());
  }
}
