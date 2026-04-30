package com.mtl.catalog.exception;

import org.springframework.http.HttpStatus;

/** Recurso de catálogo inexistente (p. ej. ficha o referencia por id). */
public class CatalogNotFoundException extends CatalogException {

  public CatalogNotFoundException(String detail) {
    super(HttpStatus.NOT_FOUND, "Recurso no encontrado", detail);
  }
}
