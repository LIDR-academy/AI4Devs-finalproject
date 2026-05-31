package com.mtl.catalog.exception;

import org.springframework.http.HttpStatus;

/** Fallo al invocar un servicio dependiente (p. ej. media-service). */
public class CatalogBadGatewayException extends CatalogException {

  public CatalogBadGatewayException(String detail) {
    super(HttpStatus.BAD_GATEWAY, "Error de servicio dependiente", detail);
  }
}
