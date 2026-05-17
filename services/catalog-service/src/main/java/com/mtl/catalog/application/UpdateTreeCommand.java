package com.mtl.catalog.application;

import com.mtl.catalog.dto.CreateTreeRequest;
import java.math.BigDecimal;

/** Comando de actualización de ficha (campos editables del alta; el creador no cambia). */
public record UpdateTreeCommand(
    Long especieId,
    Long provinciaId,
    BigDecimal latitud,
    BigDecimal longitud,
    String municipio,
    String descripcion,
    Integer altitud,
    String visibilidadMapaPublico,
    String estadoPublicacion) {

  public static UpdateTreeCommand fromRequest(CreateTreeRequest request) {
    return new UpdateTreeCommand(
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
