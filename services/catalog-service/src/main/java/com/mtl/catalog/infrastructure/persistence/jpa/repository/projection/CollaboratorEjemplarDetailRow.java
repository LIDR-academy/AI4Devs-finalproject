package com.mtl.catalog.infrastructure.persistence.jpa.repository.projection;

import java.math.BigDecimal;
import java.time.Instant;

public interface CollaboratorEjemplarDetailRow {
  Long getEjemplarId();

  Long getSpeciesId();

  Long getProvinceId();

  BigDecimal getLatitude();

  BigDecimal getLongitude();

  String getMunicipality();

  String getDescription();

  Integer getAltitude();

  String getPublicationState();

  String getPublicMapVisibility();

  Long getCreatedByUserId();

  String getNombreComun();

  String getNombreCientifico();

  String getProvinciaNombre();

  String getProvinciaCodigo();

  Instant getCreatedAt();

  Instant getModifiedAt();
}
