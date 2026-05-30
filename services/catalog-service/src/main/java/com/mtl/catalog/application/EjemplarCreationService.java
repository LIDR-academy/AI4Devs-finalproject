package com.mtl.catalog.application;

import static com.mtl.catalog.application.EjemplarCatalogRules.MAX_ESTADO_PUBLICACION;
import static com.mtl.catalog.application.EjemplarCatalogRules.MAX_MUNICIPIO;
import static com.mtl.catalog.application.EjemplarCatalogRules.MAX_VISIBILIDAD;
import static com.mtl.catalog.application.EjemplarCatalogRules.blankToNull;
import static com.mtl.catalog.application.EjemplarCatalogRules.truncate;
import static com.mtl.catalog.application.EjemplarCatalogRules.validateAndNormalizePublicationState;
import static com.mtl.catalog.application.EjemplarCatalogRules.validateAndNormalizeVisibility;
import static com.mtl.catalog.application.EjemplarCatalogRules.validateCoordinates;
import static com.mtl.catalog.application.EjemplarCatalogRules.validateMasters;

import com.mtl.catalog.domain.Ejemplar;
import com.mtl.catalog.domain.UsuarioApp;
import com.mtl.catalog.exception.CatalogValidationException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EjemplarRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EspecieRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ProvinciaReadRepository;
import com.mtl.catalog.util.OidcUserProfileExtractor.OidcUserProfile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EjemplarCreationService {

  private final UsuarioAppMaterializationService usuarioAppMaterializationService;
  private final EspecieRepository especieRepository;
  private final ProvinciaReadRepository provinciaReadRepository;
  private final EjemplarRepository ejemplarRepository;

  public EjemplarCreationService(
      UsuarioAppMaterializationService usuarioAppMaterializationService,
      EspecieRepository especieRepository,
      ProvinciaReadRepository provinciaReadRepository,
      EjemplarRepository ejemplarRepository) {
    this.usuarioAppMaterializationService = usuarioAppMaterializationService;
    this.especieRepository = especieRepository;
    this.provinciaReadRepository = provinciaReadRepository;
    this.ejemplarRepository = ejemplarRepository;
  }

  @Transactional
  public CreatedEjemplarResult create(CreateEjemplarCommand command) {
    String subject = command.subjectOidc() == null ? "" : command.subjectOidc().trim();
    if (subject.isEmpty()) {
      throw new CatalogValidationException("Se requiere el identificador de usuario (subject OIDC).");
    }
    validateCoordinates(command.latitud(), command.longitud());
    validateMasters(
        command.especieId(), command.provinciaId(), especieRepository, provinciaReadRepository);

    UsuarioApp creator =
        usuarioAppMaterializationService.materialize(
            new OidcUserProfile(subject, command.email(), command.nombrePerfil()));
    Long creatorId = creator.getId();

    Ejemplar ejemplar = new Ejemplar();
    ejemplar.setEspecie(especieRepository.getReferenceById(command.especieId()));
    ejemplar.setProvincia(provinciaReadRepository.getReferenceById(command.provinciaId()));
    ejemplar.setUsuarioApp(creator);
    ejemplar.setMunicipio(truncate(blankToNull(command.municipio()), MAX_MUNICIPIO));
    ejemplar.setDescripcion(blankToNull(command.descripcion()));
    ejemplar.setVisibilidadMapaPublico(
        validateAndNormalizeVisibility(
            truncate(blankToNull(command.visibilidadMapaPublico()), MAX_VISIBILIDAD)));
    ejemplar.setLatitud(command.latitud());
    ejemplar.setLongitud(command.longitud());
    ejemplar.setAltitud(command.altitud());
    ejemplar.setEstadoPublicacion(
        validateAndNormalizePublicationState(
            truncate(blankToNull(command.estadoPublicacion()), MAX_ESTADO_PUBLICACION)));

    Ejemplar saved = ejemplarRepository.save(ejemplar);
    return new CreatedEjemplarResult(saved.getId(), creatorId, saved.getCreadoEn());
  }
}
