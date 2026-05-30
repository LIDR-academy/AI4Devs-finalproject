package com.mtl.catalog.infrastructure.persistence.jpa.repository.projection;

import java.math.BigDecimal;
import java.time.Instant;

public interface CollaboratorEjemplarDetailRow {
  Long getTreeId();

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

  String getCommonName();

  String getScientificName();

  String getProvinceName();

  String getProvinceCode();

  Instant getCreatedAt();

  Instant getModifiedAt();
}
