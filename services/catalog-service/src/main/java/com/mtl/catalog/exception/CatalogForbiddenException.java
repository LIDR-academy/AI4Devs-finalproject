package com.mtl.catalog.exception;

import org.springframework.http.HttpStatus;

/** Operación no permitida para el actor autenticado (p. ej. permiso sobre un árbol). */
public class CatalogForbiddenException extends CatalogException {

  public CatalogForbiddenException(String detail) {
    super(HttpStatus.FORBIDDEN, "Acceso denegado", detail);
  }
}
