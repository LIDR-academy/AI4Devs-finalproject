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
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EjemplarRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EspecieRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ProvinciaReadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EjemplarUpdateService {

  private final EjemplarRepository ejemplarRepository;
  private final EspecieRepository especieRepository;
  private final ProvinciaReadRepository provinciaReadRepository;

  public EjemplarUpdateService(
      EjemplarRepository ejemplarRepository,
      EspecieRepository especieRepository,
      ProvinciaReadRepository provinciaReadRepository) {
    this.ejemplarRepository = ejemplarRepository;
    this.especieRepository = especieRepository;
    this.provinciaReadRepository = provinciaReadRepository;
  }

  @Transactional
  public EjemplarUpdateResult update(
      long ejemplarId, UpdateEjemplarCommand command, long actorUsuarioAppId, boolean admin) {
    Ejemplar ejemplar =
        ejemplarRepository
            .findById(ejemplarId)
            .orElseThrow(
                () ->
                    new CatalogNotFoundException(
                        "No se encontró un árbol con el identificador indicado."));

    if (!admin && !ejemplar.getUsuarioAppId().equals(actorUsuarioAppId)) {
      throw new CatalogForbiddenException("No tiene permiso para modificar esta ficha de árbol.");
    }

    validateCoordinates(command.latitud(), command.longitud());
    validateMasters(
        command.especieId(), command.provinciaId(), especieRepository, provinciaReadRepository);

    long especieIdPrev = ejemplar.getEspecieId();
    long provinciaIdPrev = ejemplar.getProvinciaId();

    ejemplar.setEspecie(especieRepository.getReferenceById(command.especieId()));
    ejemplar.setProvincia(provinciaReadRepository.getReferenceById(command.provinciaId()));
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

    ejemplarRepository.save(ejemplar);

    return new EjemplarUpdateResult(
        ejemplar.getId(), especieIdPrev, provinciaIdPrev, command.especieId(), command.provinciaId());
  }
}
