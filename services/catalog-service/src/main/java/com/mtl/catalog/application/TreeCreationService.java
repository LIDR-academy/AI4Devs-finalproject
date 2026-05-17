package com.mtl.catalog.application;

import static com.mtl.catalog.application.TreeCatalogRules.MAX_ESTADO_PUBLICACION;
import static com.mtl.catalog.application.TreeCatalogRules.MAX_MUNICIPIO;
import static com.mtl.catalog.application.TreeCatalogRules.MAX_VISIBILIDAD;
import static com.mtl.catalog.application.TreeCatalogRules.blankToNull;
import static com.mtl.catalog.application.TreeCatalogRules.truncate;
import static com.mtl.catalog.application.TreeCatalogRules.validateAndNormalizePublicationState;
import static com.mtl.catalog.application.TreeCatalogRules.validateAndNormalizeVisibility;
import static com.mtl.catalog.application.TreeCatalogRules.validateCoordinates;
import static com.mtl.catalog.application.TreeCatalogRules.validateMasters;

import com.mtl.catalog.domain.Arbol;
import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.exception.CatalogValidationException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ArbolRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EspecieReadRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ProvinciaReadRepository;
import com.mtl.catalog.util.OidcUserProfileExtractor.OidcUserProfile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TreeCreationService {

  private final UsuarioAppMaterializationService usuarioAppMaterializationService;
  private final EspecieReadRepository especieReadRepository;
  private final ProvinciaReadRepository provinciaReadRepository;
  private final ArbolRepository arbolRepository;

  public TreeCreationService(
      UsuarioAppMaterializationService usuarioAppMaterializationService,
      EspecieReadRepository especieReadRepository,
      ProvinciaReadRepository provinciaReadRepository,
      ArbolRepository arbolRepository) {
    this.usuarioAppMaterializationService = usuarioAppMaterializationService;
    this.especieReadRepository = especieReadRepository;
    this.provinciaReadRepository = provinciaReadRepository;
    this.arbolRepository = arbolRepository;
  }

  @Transactional
  public CreatedTreeResult create(CreateTreeCommand command) {
    String subject = command.subjectOidc() == null ? "" : command.subjectOidc().trim();
    if (subject.isEmpty()) {
      throw new CatalogValidationException("Se requiere el identificador de usuario (subject OIDC).");
    }
    validateCoordinates(command.latitud(), command.longitud());
    validateMasters(
        command.especieId(), command.provinciaId(), especieReadRepository, provinciaReadRepository);

    UsuarioApp creator =
        usuarioAppMaterializationService.materialize(
            new OidcUserProfile(subject, command.email(), command.nombrePerfil()));
    Long creatorId = creator.getId();

    Arbol arbol = new Arbol();
    arbol.setEspecieId(command.especieId());
    arbol.setProvinciaId(command.provinciaId());
    arbol.setUsuarioAppId(creatorId);
    arbol.setMunicipio(truncate(blankToNull(command.municipio()), MAX_MUNICIPIO));
    arbol.setDescripcion(blankToNull(command.descripcion()));
    arbol.setVisibilidadMapaPublico(
        validateAndNormalizeVisibility(
            truncate(blankToNull(command.visibilidadMapaPublico()), MAX_VISIBILIDAD)));
    arbol.setLatitud(command.latitud());
    arbol.setLongitud(command.longitud());
    arbol.setAltitud(command.altitud());
    arbol.setEstadoPublicacion(
        validateAndNormalizePublicationState(
            truncate(blankToNull(command.estadoPublicacion()), MAX_ESTADO_PUBLICACION)));

    Arbol saved = arbolRepository.save(arbol);
    return new CreatedTreeResult(saved.getId(), creatorId, saved.getCreadoEn());
  }
}
