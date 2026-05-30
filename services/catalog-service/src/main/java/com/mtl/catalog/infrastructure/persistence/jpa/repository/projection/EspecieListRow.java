package com.mtl.catalog.infrastructure.persistence.jpa.repository.projection;

/** Proyección de fila para consulta nativa de listado de especies (Spring Data mapea por alias). */
public interface EspecieListRow {

  Long getId();

  String getNombreComun();

  String getNombreCientifico();

  Long getGeneroId();

  String getGeneroNombreComun();

  String getGeneroNombreCientifico();
}
