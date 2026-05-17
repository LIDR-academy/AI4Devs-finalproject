package com.mtl.catalog.application;

import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.dto.CollaboratorTreeDetailDto;
import com.mtl.catalog.dto.CreateTreeRequest;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.CollaboratorTreeReadRepository;
import com.mtl.catalog.util.JwtRealmRoles;
import com.mtl.catalog.util.OidcUserProfileExtractor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TreeModificationService {

  private final UsuarioAppMaterializationService usuarioAppMaterializationService;
  private final TreeUpdateService treeUpdateService;
  private final CatalogAuditService catalogAuditService;
  private final CollaboratorTreeReadRepository collaboratorTreeReadRepository;

  public TreeModificationService(
      UsuarioAppMaterializationService usuarioAppMaterializationService,
      TreeUpdateService treeUpdateService,
      CatalogAuditService catalogAuditService,
      CollaboratorTreeReadRepository collaboratorTreeReadRepository) {
    this.usuarioAppMaterializationService = usuarioAppMaterializationService;
    this.treeUpdateService = treeUpdateService;
    this.catalogAuditService = catalogAuditService;
    this.collaboratorTreeReadRepository = collaboratorTreeReadRepository;
  }

  @Transactional
  public CollaboratorTreeDetailDto updateTree(long treeId, CreateTreeRequest request, Jwt jwt) {
    UsuarioApp actor =
        usuarioAppMaterializationService.materialize(OidcUserProfileExtractor.extract(jwt));
    boolean admin = JwtRealmRoles.hasRealmRole(jwt, "ADMIN");
    boolean collaborator = JwtRealmRoles.hasRealmRole(jwt, "COLABORADOR");

    if (!admin && !collaborator) {
      throw new CatalogForbiddenException(
          "Se requiere rol COLABORADOR o ADMIN para modificar fichas de árbol.");
    }

    TreeUpdateResult updated =
        treeUpdateService.update(
            treeId, UpdateTreeCommand.fromRequest(request), actor.getId(), admin);

    catalogAuditService.recordTreeModified(
        actor.getId(),
        updated.arbolId(),
        updated.especieIdPrev(),
        updated.provinciaIdPrev(),
        updated.especieIdNew(),
        updated.provinciaIdNew());

    return collaboratorTreeReadRepository
        .findCollaboratorTreeDetailRow(treeId)
        .map(CollaboratorTreeDetailMapper::toDetailDto)
        .orElseThrow(
            () ->
                new CatalogNotFoundException(
                    "No se encontró un árbol con el identificador indicado."));
  }

}
