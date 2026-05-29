package com.mtl.catalog.infrastructure.persistence.jpa.repository.projection;

public interface PublicEjemplarListRow {
  Long getEjemplarId();

  String getNombreComun();

  String getNombreCientifico();

  String getProvincia();

  String getMunicipio();

  String getEstado();

  String getVisibilidad();
}
