package com.hexagonal.identity.infrastructure.in.rest.exception;

import com.hexagonal.identity.domain.exception.CredencialGoogleInvalidaException;
import com.hexagonal.identity.infrastructure.in.rest.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Global exception handler for the Identity BC REST layer.
 *
 * <p>Translates domain and validation exceptions to HTTP error responses that comply with
 * the {@code ErrorResponse} schema defined in {@code openapi/identity/US1.yaml}.</p>
 *
 * <p>Architecture: Infrastructure In — only maps exceptions to HTTP; no business logic.</p>
 *
 * <p>Handled exceptions:</p>
 * <ul>
 *   <li>{@link CredencialGoogleInvalidaException} → 401 INVALID_GOOGLE_TOKEN</li>
 *   <li>{@link IllegalArgumentException} → 400 BAD_REQUEST (use case guard violations)</li>
 *   <li>{@link MethodArgumentNotValidException} → 400 BAD_REQUEST (bean validation)</li>
 * </ul>
 */
@RestControllerAdvice(basePackages = "com.hexagonal.identity.infrastructure.in.rest")
public class IdentityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(IdentityExceptionHandler.class);

    /**
     * C2/C1 — Google id_token is invalid or expired (domain exception → HTTP 401).
     */
    @ExceptionHandler(CredencialGoogleInvalidaException.class)
    public ResponseEntity<ErrorResponse> handleGoogleCredentialInvalid(
            CredencialGoogleInvalidaException ex) {
        log.warn("Invalid Google credential: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(
                        "INVALID_GOOGLE_TOKEN",
                        "No ha sido posible iniciar sesion. Por favor, intentalo de nuevo."));
    }

    /**
     * Use case guard violations (null/blank idToken or token in logout) → HTTP 400.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadArgument(IllegalArgumentException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return ResponseEntity
                .badRequest()
                .body(new ErrorResponse("BAD_REQUEST", ex.getMessage()));
    }

    /**
     * Bean-validation failures (missing required fields in request body) → HTTP 400.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getAllErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Invalid request");
        log.warn("Validation failed: {}", message);
        return ResponseEntity
                .badRequest()
                .body(new ErrorResponse("BAD_REQUEST", message));
    }
}
