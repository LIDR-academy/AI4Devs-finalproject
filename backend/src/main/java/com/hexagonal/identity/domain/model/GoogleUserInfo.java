package com.hexagonal.identity.domain.model;

import java.util.Objects;

/**
 * Value Object: GoogleUserInfo
 *
 * <p>Contains the user data extracted from a validated Google {@code id_token}.
 * This is the input to the authentication use case — the data Google tells us
 * about the user after they authorize access.</p>
 *
 * <p>Architecture: pure value object, no Spring, no HTTP dependencies.</p>
 */
public record GoogleUserInfo(
        String identificadorGoogle,   // Google "sub" claim — stable unique identifier
        String correo,                // "email" claim
        String nombre,                // "name" claim
        String urlFoto                // "picture" claim — nullable
) {
    public GoogleUserInfo {
        requireNonBlank(identificadorGoogle, "identificadorGoogle");
        requireNonBlank(correo, "correo");
        requireNonBlank(nombre, "nombre");
        // urlFoto is intentionally nullable
    }

    private static void requireNonBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be null or blank");
        }
    }
}
