package com.mtl.catalog.application;

import com.mtl.catalog.dto.CollaboratorTreeDetailDto;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.CollaboratorTreeDetailRow;
import com.mtl.catalog.util.ProvinceLabelFormatter;
import com.mtl.catalog.util.SpeciesLabelFormatter;

final class CollaboratorTreeDetailMapper {

  private CollaboratorTreeDetailMapper() {}

  static CollaboratorTreeDetailDto toDetailDto(CollaboratorTreeDetailRow row) {
    return new CollaboratorTreeDetailDto(
        row.getTreeId(),
        row.getSpeciesId(),
        row.getProvinceId(),
        row.getLatitude(),
        row.getLongitude(),
        row.getMunicipality(),
        row.getDescription(),
        row.getAltitude(),
        row.getPublicationState(),
        row.getPublicMapVisibility(),
        row.getCreatedByUserId(),
        SpeciesLabelFormatter.format(row.getNombreComun(), row.getNombreCientifico()),
        ProvinceLabelFormatter.format(row.getProvinciaNombre(), row.getProvinciaCodigo()),
        row.getCreatedAt(),
        row.getModifiedAt());
  }
}
