package com.mtl.catalog.application;

import com.mtl.catalog.domain.Arbol;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ArbolRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TreeDeleteService {

  private final ArbolRepository arbolRepository;
  private final TreeEnrichmentDeletionPort treeEnrichmentDeletionPort;
  private final CatalogAuditService catalogAuditService;

  public TreeDeleteService(
      ArbolRepository arbolRepository,
      TreeEnrichmentDeletionPort treeEnrichmentDeletionPort,
      CatalogAuditService catalogAuditService) {
    this.arbolRepository = arbolRepository;
    this.treeEnrichmentDeletionPort = treeEnrichmentDeletionPort;
    this.catalogAuditService = catalogAuditService;
  }

  public TreeDeleteAuthorization authorize(long treeId, long actorUsuarioAppId, boolean admin) {
    Arbol arbol =
        arbolRepository
            .findById(treeId)
            .orElseThrow(
                () ->
                    new CatalogNotFoundException(
                        "No se encontró un árbol con el identificador indicado."));

    if (!admin && !arbol.getUsuarioAppId().equals(actorUsuarioAppId)) {
      throw new CatalogForbiddenException("No tiene permiso para eliminar esta ficha de árbol.");
    }

    return new TreeDeleteAuthorization(treeId, arbol.getEspecieId(), arbol.getProvinciaId());
  }

  @Transactional
  public void commitPhysicalDelete(TreeDeleteAuthorization authorization, long actorUsuarioAppId) {
    if (!arbolRepository.existsById(authorization.treeId())) {
      throw new CatalogNotFoundException("No se encontró un árbol con el identificador indicado.");
    }
    arbolRepository.deleteById(authorization.treeId());
    treeEnrichmentDeletionPort.deleteEnrichmentForTree(authorization.treeId());
    catalogAuditService.recordTreeDeleted(
        actorUsuarioAppId,
        authorization.treeId(),
        authorization.especieId(),
        authorization.provinciaId());
  }
}
