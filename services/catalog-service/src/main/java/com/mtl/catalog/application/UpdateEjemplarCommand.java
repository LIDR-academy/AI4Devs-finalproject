package com.mtl.catalog.application;

import com.mtl.catalog.dto.CreateEjemplarRequest;
import java.math.BigDecimal;

/** Comando de actualización de ficha (campos editables del alta; el creador no cambia). */
public record UpdateEjemplarCommand(
    Long especieId,
    Long provinciaId,
    BigDecimal latitud,
    BigDecimal longitud,
    String municipio,
    String descripcion,
    Integer altitud,
    String visibilidadMapaPublico,
    String estadoPublicacion) {

  public static UpdateEjemplarCommand fromRequest(CreateEjemplarRequest request) {
    return new UpdateEjemplarCommand(
        request.speciesId(),
        request.provinceId(),
        request.latitude(),
        request.longitude(),
        request.municipality(),
        request.description(),
        request.altitude(),
        request.publicMapVisibility(),
        request.publicationState());
  }
}
