package com.hexagonal.identity.domain.model;

import java.util.Objects;
import java.util.UUID;

/**
 * Value Object: SesionToken
 *
 * <p>Represents the session JWT issued by this backend (not a Google token)
 * after successful authentication. Contains the token string and the
 * resolved {@code userId} so callers don't need to decode the token themselves.</p>
 *
 * <p>Architecture: pure value object, no Spring, no HTTP dependencies.</p>
 */
public record SesionToken(
        String token,    // The signed JWT string
        UUID userId      // Internal user identifier (extracted from the JWT sub claim)
) {
    public SesionToken {
        Objects.requireNonNull(token, "token cannot be null");
        if (token.isBlank()) throw new IllegalArgumentException("token must not be blank");
        Objects.requireNonNull(userId, "userId cannot be null");
    }
}
