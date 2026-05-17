package com.mtl.media.web.error;

import com.mtl.media.exception.MediaStorageException;
import com.mtl.media.exception.MediaUploadValidationException;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class MediaExceptionHandler {

  @ExceptionHandler(MediaStorageException.class)
  public ResponseEntity<ProblemDetail> handleStorageFailure(
      MediaStorageException ex, HttpServletRequest request) {
    ProblemDetail detail =
        ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_GATEWAY,
            ex.getMessage() != null
                ? ex.getMessage()
                : "No se pudo completar la operación en el almacén de objetos.");
    detail.setTitle("Error de almacenamiento");
    detail.setInstance(URI.create(request.getRequestURI()));
    ProblemDetailEnricher.enrichWithCorrelationId(detail);
    return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(detail);
  }

  @ExceptionHandler(MediaUploadValidationException.class)
  public ResponseEntity<ProblemDetail> handleUploadValidation(
      MediaUploadValidationException ex, HttpServletRequest request) {
    ProblemDetail detail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    detail.setTitle("Solicitud inválida para subida de fotografía");
    detail.setInstance(URI.create(request.getRequestURI()));
    ProblemDetailEnricher.enrichWithCorrelationId(detail);
    return ResponseEntity.badRequest().body(detail);
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<ProblemDetail> handleResponseStatus(
      ResponseStatusException ex, HttpServletRequest request) {
    String detail =
        ex.getReason() != null ? ex.getReason() : ex.getStatusCode().toString();
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(ex.getStatusCode(), detail);
    pd.setTitle(ex.getStatusCode().toString());
    pd.setInstance(URI.create(request.getRequestURI()));
    ProblemDetailEnricher.enrichWithCorrelationId(pd);
    return ResponseEntity.status(ex.getStatusCode()).body(pd);
  }
}
