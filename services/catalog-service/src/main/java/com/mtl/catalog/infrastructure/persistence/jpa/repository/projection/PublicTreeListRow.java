package com.mtl.catalog.infrastructure.persistence.jpa.repository.projection;

public interface PublicTreeListRow {
  Long getTreeId();

  String getNombreComun();

  String getNombreCientifico();

  String getProvincia();

  String getMunicipio();

  String getEstado();

  String getVisibilidad();
}
