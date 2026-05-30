package com.mtl.catalog.infrastructure.persistence.jpa.repository.projection;

import java.math.BigDecimal;

public interface PublicEjemplarDetailRow {
  Long getEjemplarId();

  String getCommonName();

  String getScientificName();

  String getProvince();

  String getMunicipality();

  String getPublicationState();

  String getPublicMapVisibility();

  String getDescription();

  BigDecimal getLatitude();

  BigDecimal getLongitude();

  Integer getAltitude();
}
