package com.mtl.catalog.exception;

import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

/**
 * Excepción de negocio o aplicación del catálogo; se traduce a {@link ProblemDetail} (RFC 9457) en el manejador global.
 */
public class CatalogException extends RuntimeException {

  private final HttpStatus status;
  private final String title;

  public CatalogException(HttpStatus status, String title, String detail) {
    super(detail);
    this.status = status;
    this.title = title;
  }

  public HttpStatus getStatus() {
    return status;
  }

  public String getTitle() {
    return title;
  }

  public String getDetail() {
    return getMessage();
  }

  public ProblemDetail toProblemDetail(URI instance) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(status, getDetail());
    pd.setTitle(title);
    pd.setInstance(instance);
    return pd;
  }
}
