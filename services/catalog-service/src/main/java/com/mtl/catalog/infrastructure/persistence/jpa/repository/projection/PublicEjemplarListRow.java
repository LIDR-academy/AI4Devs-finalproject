package com.mtl.catalog.infrastructure.persistence.jpa.repository.projection;

public interface PublicEjemplarListRow {
  Long getTreeId();

  String getCommonName();

  String getScientificName();

  String getProvince();

  String getMunicipality();

  String getPublicationState();

  String getPublicMapVisibility();
}
