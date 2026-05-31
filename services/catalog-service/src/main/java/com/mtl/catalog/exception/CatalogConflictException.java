package com.mtl.catalog.exception;

import org.springframework.http.HttpStatus;

/** Conflicto de negocio (p. ej. baja bloqueada por referencias existentes). */
public class CatalogConflictException extends CatalogException {

  public CatalogConflictException(String detail) {
    super(HttpStatus.CONFLICT, "Conflicto", detail);
  }
}
