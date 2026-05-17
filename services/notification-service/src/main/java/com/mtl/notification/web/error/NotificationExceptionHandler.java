package com.mtl.notification.web.error;

import com.mtl.notification.exception.NotificationException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.net.URI;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class NotificationExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(NotificationExceptionHandler.class);
  private static final String TITLE_BAD_REQUEST = "Petición inválida";
  private static final String TITLE_CONFLICT = "Conflicto";

  @ExceptionHandler(NotificationException.class)
  public ResponseEntity<ProblemDetail> handleNotification(NotificationException ex, HttpServletRequest request) {
    log.warn("Notificaciones: {} — {}", ex.getTitle(), ex.getDetail());
    ProblemDetail pd = ex.toProblemDetail(URI.create(request.getRequestURI()));
    ProblemDetailEnricher.enrichWithCorrelationId(pd);
    return ResponseEntity.status(ex.getStatus()).body(pd);
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ProblemDetail> handleDataIntegrity(
      DataIntegrityViolationException ex, HttpServletRequest request) {
    log.warn("Violación de integridad al persistir suscriptor");
    ProblemDetail pd =
        ProblemDetail.forStatusAndDetail(
            HttpStatus.CONFLICT,
            "Ya existe una suscripción con este correo electrónico. Si estaba cancelada, contacte con un administrador.");
    pd.setTitle(TITLE_CONFLICT);
    pd.setInstance(URI.create(request.getRequestURI()));
    ProblemDetailEnricher.enrichWithCorrelationId(pd);
    return ResponseEntity.status(HttpStatus.CONFLICT).body(pd);
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<ProblemDetail> handleResponseStatus(
      ResponseStatusException ex, HttpServletRequest request) {
    String detail =
        ex.getReason() != null ? ex.getReason() : ex.getStatusCode().toString();
    log.warn("Respuesta HTTP explícita: {} {}", ex.getStatusCode(), detail);
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(ex.getStatusCode(), detail);
    pd.setTitle(ex.getStatusCode().toString());
    pd.setInstance(URI.create(request.getRequestURI()));
    ProblemDetailEnricher.enrichWithCorrelationId(pd);
    return ResponseEntity.status(ex.getStatusCode()).body(pd);
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ProblemDetail> handleConstraintViolation(
      ConstraintViolationException ex, HttpServletRequest request) {
    String detail =
        ex.getConstraintViolations().stream()
            .map(v -> v.getPropertyPath() + ": " + v.getMessage())
            .collect(Collectors.joining("; "));
    log.warn("Validación de parámetros: {}", detail);
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
    pd.setTitle(TITLE_BAD_REQUEST);
    pd.setInstance(URI.create(request.getRequestURI()));
    ProblemDetailEnricher.enrichWithCorrelationId(pd);
    return ResponseEntity.badRequest().body(pd);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ProblemDetail> handleMethodArgumentNotValid(
      MethodArgumentNotValidException ex, HttpServletRequest request) {
    String detail =
        ex.getBindingResult().getFieldErrors().stream()
            .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
            .collect(Collectors.joining("; "));
    log.warn("Validación de cuerpo: {}", detail);
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
    pd.setTitle(TITLE_BAD_REQUEST);
    pd.setInstance(URI.create(request.getRequestURI()));
    ProblemDetailEnricher.enrichWithCorrelationId(pd);
    return ResponseEntity.badRequest().body(pd);
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<ProblemDetail> handleTypeMismatch(
      MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
    String detail = "Parámetro '" + ex.getName() + "' con valor inválido";
    log.warn("Tipo de parámetro incorrecto: {}", ex.getMessage());
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
    pd.setTitle(TITLE_BAD_REQUEST);
    pd.setInstance(URI.create(request.getRequestURI()));
    ProblemDetailEnricher.enrichWithCorrelationId(pd);
    return ResponseEntity.badRequest().body(pd);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ProblemDetail> handleAny(Exception ex, HttpServletRequest request) {
    log.error(
        "Error no controlado en {} {}",
        request.getMethod(),
        request.getRequestURI(),
        ex);
    ProblemDetail pd =
        ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Ha ocurrido un error interno. Inténtelo de nuevo más tarde.");
    pd.setTitle("Error interno");
    pd.setInstance(URI.create(request.getRequestURI()));
    ProblemDetailEnricher.enrichWithCorrelationId(pd);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(pd);
  }
}
