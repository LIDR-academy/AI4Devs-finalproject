package com.mtl.catalog.application;

import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.dto.CollaboratorEjemplarDetailDto;
import com.mtl.catalog.dto.CreateEjemplarRequest;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.CollaboratorEjemplarReadRepository;
import com.mtl.catalog.util.JwtRealmRoles;
import com.mtl.catalog.util.OidcUserProfileExtractor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EjemplarModificationService {

  private final UsuarioAppMaterializationService usuarioAppMaterializationService;
  private final EjemplarUpdateService treeUpdateService;
  private final CatalogAuditService catalogAuditService;
  private final CollaboratorEjemplarReadRepository collaboratorEjemplarReadRepository;

  public EjemplarModificationService(
      UsuarioAppMaterializationService usuarioAppMaterializationService,
      EjemplarUpdateService treeUpdateService,
      CatalogAuditService catalogAuditService,
      CollaboratorEjemplarReadRepository collaboratorEjemplarReadRepository) {
    this.usuarioAppMaterializationService = usuarioAppMaterializationService;
    this.treeUpdateService = treeUpdateService;
    this.catalogAuditService = catalogAuditService;
    this.collaboratorEjemplarReadRepository = collaboratorEjemplarReadRepository;
  }

  @Transactional
  public CollaboratorEjemplarDetailDto updateEjemplar(long ejemplarId, CreateEjemplarRequest request, Jwt jwt) {
    UsuarioApp actor =
        usuarioAppMaterializationService.materialize(OidcUserProfileExtractor.extract(jwt));
    boolean admin = JwtRealmRoles.hasRealmRole(jwt, "ADMIN");
    boolean collaborator = JwtRealmRoles.hasRealmRole(jwt, "COLABORADOR");

    if (!admin && !collaborator) {
      throw new CatalogForbiddenException(
          "Se requiere rol COLABORADOR o ADMIN para modificar fichas de árbol.");
    }

    EjemplarUpdateResult updated =
        treeUpdateService.update(
            ejemplarId, UpdateEjemplarCommand.fromRequest(request), actor.getId(), admin);

    catalogAuditService.recordEjemplarModified(
        actor.getId(),
        updated.ejemplarId(),
        updated.especieIdPrev(),
        updated.provinciaIdPrev(),
        updated.especieIdNew(),
        updated.provinciaIdNew());

    return collaboratorEjemplarReadRepository
        .findCollaboratorEjemplarDetailRow(ejemplarId)
        .map(CollaboratorEjemplarDetailMapper::toDetailDto)
        .orElseThrow(
            () ->
                new CatalogNotFoundException(
                    "No se encontró un árbol con el identificador indicado."));
  }

}
