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
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ArbolRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.EspecieReadRepository;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.ProvinciaReadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TreeUpdateService {

  private final ArbolRepository arbolRepository;
  private final EspecieReadRepository especieReadRepository;
  private final ProvinciaReadRepository provinciaReadRepository;

  public TreeUpdateService(
      ArbolRepository arbolRepository,
      EspecieReadRepository especieReadRepository,
      ProvinciaReadRepository provinciaReadRepository) {
    this.arbolRepository = arbolRepository;
    this.especieReadRepository = especieReadRepository;
    this.provinciaReadRepository = provinciaReadRepository;
  }

  @Transactional
  public TreeUpdateResult update(
      long treeId, UpdateTreeCommand command, long actorUsuarioAppId, boolean admin) {
    Arbol arbol =
        arbolRepository
            .findById(treeId)
            .orElseThrow(
                () ->
                    new CatalogNotFoundException(
                        "No se encontró un árbol con el identificador indicado."));

    if (!admin && !arbol.getUsuarioAppId().equals(actorUsuarioAppId)) {
      throw new CatalogForbiddenException("No tiene permiso para modificar esta ficha de árbol.");
    }

    validateCoordinates(command.latitud(), command.longitud());
    validateMasters(
        command.especieId(), command.provinciaId(), especieReadRepository, provinciaReadRepository);

    long especieIdPrev = arbol.getEspecieId();
    long provinciaIdPrev = arbol.getProvinciaId();

    arbol.setEspecieId(command.especieId());
    arbol.setProvinciaId(command.provinciaId());
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

    arbolRepository.save(arbol);

    return new TreeUpdateResult(
        arbol.getId(), especieIdPrev, provinciaIdPrev, command.especieId(), command.provinciaId());
  }
}
