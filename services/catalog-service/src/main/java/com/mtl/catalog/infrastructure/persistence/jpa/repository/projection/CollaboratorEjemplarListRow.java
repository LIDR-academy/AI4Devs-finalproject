package com.mtl.catalog.infrastructure.persistence.jpa.repository.projection;

import java.time.Instant;

public interface CollaboratorEjemplarListRow {
  Long getEjemplarId();

  Long getSpeciesId();

  String getNombreComun();

  String getNombreCientifico();

  String getProvincia();

  String getMunicipio();

  String getPublicationState();

  String getPublicMapVisibility();

  Instant getCreatedAt();

  Instant getModifiedAt();

  Long getCreatedByUserId();
}
