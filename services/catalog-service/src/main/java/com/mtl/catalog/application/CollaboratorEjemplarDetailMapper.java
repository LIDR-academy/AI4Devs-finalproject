package com.mtl.catalog.application;

import com.mtl.catalog.dto.CollaboratorEjemplarDetailDto;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.projection.CollaboratorEjemplarDetailRow;
import com.mtl.catalog.util.ProjectionTimestamps;
import com.mtl.catalog.util.ProvinceLabelFormatter;
import com.mtl.catalog.util.SpeciesLabelFormatter;

final class CollaboratorEjemplarDetailMapper {

  private CollaboratorEjemplarDetailMapper() {}

  static CollaboratorEjemplarDetailDto toDetailDto(CollaboratorEjemplarDetailRow row) {
    return new CollaboratorEjemplarDetailDto(
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
        SpeciesLabelFormatter.format(row.getCommonName(), row.getScientificName()),
        ProvinceLabelFormatter.format(row.getProvinceName(), row.getProvinceCode()),
        ProjectionTimestamps.toOffsetDateTime(row.getCreatedAt()),
        ProjectionTimestamps.toOffsetDateTime(row.getModifiedAt()));
  }
}
