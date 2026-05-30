package com.mtl.catalog.application;

import com.mtl.catalog.dto.CreateEjemplarRequest;
import com.mtl.catalog.exception.CatalogValidationException;
import com.mtl.catalog.util.OidcUserProfileExtractor;
import com.mtl.catalog.util.OidcUserProfileExtractor.OidcUserProfile;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EjemplarRegistrationService {

  private final EjemplarCreationService treeCreationService;
  private final CatalogAuditService catalogAuditService;
  private final AfterCommitTaskRegistrar afterCommitTaskRegistrar;
  private final EjemplarCreadoEventPublisher ejemplarCreadoEventPublisher;

  public EjemplarRegistrationService(
      EjemplarCreationService treeCreationService,
      CatalogAuditService catalogAuditService,
      AfterCommitTaskRegistrar afterCommitTaskRegistrar,
      EjemplarCreadoEventPublisher ejemplarCreadoEventPublisher) {
    this.treeCreationService = treeCreationService;
    this.catalogAuditService = catalogAuditService;
    this.afterCommitTaskRegistrar = afterCommitTaskRegistrar;
    this.ejemplarCreadoEventPublisher = ejemplarCreadoEventPublisher;
  }

  @Transactional
  public CreatedEjemplarResult register(CreateEjemplarRequest request, Jwt jwt) {
    OidcUserProfile profile = OidcUserProfileExtractor.extract(jwt);
    if (profile.email() == null) {
      throw new CatalogValidationException(
          "El token de acceso debe incluir el correo electrónico (scope email) para registrar o"
              + " actualizar el usuario de la aplicación.");
    }
    CreateEjemplarCommand command = CreateEjemplarCommand.fromRequest(request, profile);
    CreatedEjemplarResult created = treeCreationService.create(command);
    catalogAuditService.recordEjemplarCreated(
        created.actorUsuarioAppId(),
        created.treeId(),
        command.especieId(),
        command.provinciaId());
    afterCommitTaskRegistrar.runAfterCommit(
        () ->
            ejemplarCreadoEventPublisher.publishEjemplarCreado(created.treeId(), created.ocurridoEn()));
    return created;
  }
}
