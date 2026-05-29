package com.mtl.catalog.infrastructure.persistence.jpa.repository.projection;

import java.math.BigDecimal;

public interface PublicEjemplarDetailRow {
  Long getEjemplarId();

  String getNombreComun();

  String getNombreCientifico();

  String getProvincia();

  String getMunicipio();

  String getEstado();

  String getVisibilidad();

  String getDescripcion();

  BigDecimal getLatitud();

  BigDecimal getLongitud();

  Integer getAltura();
}
