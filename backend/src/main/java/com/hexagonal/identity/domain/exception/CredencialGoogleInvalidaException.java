package com.hexagonal.identity.domain.exception;

/**
 * Thrown when a Google id_token cannot be validated.
 *
 * <p>BDD origin: the failure path of the authentication scenarios
 * (invalid or expired Google credential).</p>
 *
 * <p>Architecture: domain exception — no Spring, no HTTP status codes here.
 * Controllers translate this to HTTP 401.</p>
 */
public class CredencialGoogleInvalidaException extends RuntimeException {

    public CredencialGoogleInvalidaException(String message) {
        super(message);
    }

    public CredencialGoogleInvalidaException(String message, Throwable cause) {
        super(message, cause);
    }
}
