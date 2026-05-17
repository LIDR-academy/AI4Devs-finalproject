package com.mtl.catalog.infrastructure.persistence.jpa.repository.projection;

/** Proyección de fila para consulta nativa de listado de provincias (Spring Data mapea por alias). */
public interface ProvinciaListRow {

  Long getId();

  String getNombre();

  String getCodigo();
}
