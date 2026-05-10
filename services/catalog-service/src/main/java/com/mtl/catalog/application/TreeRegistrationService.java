package com.mtl.catalog.application;

import com.mtl.catalog.dto.CreateTreeRequest;
import com.mtl.catalog.exception.CatalogValidationException;
import com.mtl.catalog.util.OidcUserProfileExtractor;
import com.mtl.catalog.util.OidcUserProfileExtractor.OidcUserProfile;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TreeRegistrationService {

  private final TreeCreationService treeCreationService;
  private final CatalogAuditService catalogAuditService;
  private final AfterCommitTaskRegistrar afterCommitTaskRegistrar;
  private final ArbolCreadoEventPublisher arbolCreadoEventPublisher;

  public TreeRegistrationService(
      TreeCreationService treeCreationService,
      CatalogAuditService catalogAuditService,
      AfterCommitTaskRegistrar afterCommitTaskRegistrar,
      ArbolCreadoEventPublisher arbolCreadoEventPublisher) {
    this.treeCreationService = treeCreationService;
    this.catalogAuditService = catalogAuditService;
    this.afterCommitTaskRegistrar = afterCommitTaskRegistrar;
    this.arbolCreadoEventPublisher = arbolCreadoEventPublisher;
  }

  @Transactional
  public CreatedTreeResult register(CreateTreeRequest request, Jwt jwt) {
    OidcUserProfile profile = OidcUserProfileExtractor.extract(jwt);
    if (profile.email() == null) {
      throw new CatalogValidationException(
          "El token de acceso debe incluir el correo electrónico (scope email) para registrar o"
              + " actualizar el usuario de la aplicación.");
    }
    CreateTreeCommand command = CreateTreeCommand.fromRequest(request, profile);
    CreatedTreeResult created = treeCreationService.create(command);
    catalogAuditService.recordTreeCreated(
        created.actorUsuarioAppId(),
        created.arbolId(),
        command.especieId(),
        command.provinciaId());
    afterCommitTaskRegistrar.runAfterCommit(
        () ->
            arbolCreadoEventPublisher.publishArbolCreado(created.arbolId(), created.ocurridoEn()));
    return created;
  }
}
