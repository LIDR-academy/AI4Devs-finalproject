package com.hexagonal.shared.security;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/**
 * Utility class for extracting authenticated user information from the Spring Security context.
 *
 * <p>Used by all infrastructure controllers (Playback, Generation, MeditationBuilder)
 * after T008 migration — replaces the legacy {@code X-User-Id} header pattern.</p>
 *
 * <p>The principal set by {@link SessionJwtAuthenticationFilter} is a {@code String}
 * representation of the authenticated user's {@code UUID}.</p>
 *
 * <p>Architecture: shared security utility — infrastructure layer only.</p>
 */
public final class SecurityContextHelper {

    private SecurityContextHelper() {
        // utility class — no instances
    }

    /**
     * Extracts the authenticated user's UUID from the current {@link SecurityContextHolder}.
     *
     * @return the authenticated user's UUID
     * @throws IllegalStateException if there is no authenticated user in the security context
     *         (maps to HTTP 401 when handled by the global exception handler)
     */
    public static UUID getRequiredUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null
                || !auth.isAuthenticated()
                || auth instanceof AnonymousAuthenticationToken
                || auth.getPrincipal() == null) {
            throw new IllegalStateException("Authenticated user is required");
        }

        try {
            return UUID.fromString(auth.getPrincipal().toString());
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(
                    "Cannot extract userId from security context: invalid UUID principal '"
                            + auth.getPrincipal() + "'", e);
        }
    }
}
