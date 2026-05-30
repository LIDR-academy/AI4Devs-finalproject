package com.mtl.catalog.exception;

import org.springframework.http.HttpStatus;

/** Regla de negocio o entrada rechazada con mensaje seguro para el cliente. */
public class CatalogValidationException extends CatalogException {

  public CatalogValidationException(String detail) {
    super(HttpStatus.BAD_REQUEST, "Solicitud no válida", detail);
  }
}
