package com.hexagonal.identity.domain.model;

import java.time.Clock;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Aggregate Root: PerfilDeUsuario
 *
 * <p>Represents the unique identity of a user within Meditation Builder.
 * The {@code id} (UUID) generated here is the user identifier propagated
 * to all other bounded contexts (meditationbuilder, generation, playback).</p>
 *
 * <p>Domain rules derived from BDD (spec.md):</p>
 * <ul>
 *   <li>Each user has exactly one profile tied to their Google account.</li>
 *   <li>Profile is created once (first access) and recovered unchanged on subsequent accesses.</li>
 *   <li>The {@code identificadorGoogle} (Google sub claim) is the uniqueness key — it never changes.</li>
 * </ul>
 *
 * <p>Architecture: no Spring, no HTTP, no DB access. Pure domain object (Java 21 record).</p>
 */
public record PerfilDeUsuario(
        UUID id,
        String identificadorGoogle,
        String correo,
        String nombre,
        String urlFoto,          // nullable — Google may not provide a photo
        Instant creadoEn
) {
    // ─── Canonical constructor — invariants ────────────────────────────────────

    public PerfilDeUsuario {
        Objects.requireNonNull(id, "id cannot be null");
        requireNonBlank(identificadorGoogle, "identificadorGoogle");
        requireNonBlank(correo, "correo");
        requireNonBlank(nombre, "nombre");
        Objects.requireNonNull(creadoEn, "creadoEn cannot be null");
    }

    // ─── Factories ─────────────────────────────────────────────────────────────

    /**
     * Creates a new profile for a first-time user.
     * Generates a new UUID as internal user identifier; sets {@code creadoEn} from Clock.
     *
     * <p>BDD origin: "Primer acceso de un usuario nuevo con su cuenta de Gmail"</p>
     */
    public static PerfilDeUsuario nuevo(
            String identificadorGoogle,
            String correo,
            String nombre,
            String urlFoto,
            Clock clock) {
        Objects.requireNonNull(clock, "clock cannot be null");
        return new PerfilDeUsuario(
                UUID.randomUUID(),
                identificadorGoogle,
                correo,
                nombre,
                urlFoto,
                Instant.now(clock)
        );
    }

    /**
     * Reconstructs an existing profile from persistence (returning user).
     * Preserves the original UUID and {@code creadoEn} — no modification.
     *
     * <p>BDD origin: "Acceso recurrente de un usuario ya registrado"</p>
     */
    public static PerfilDeUsuario reconocer(
            UUID id,
            String identificadorGoogle,
            String correo,
            String nombre,
            String urlFoto,
            Instant creadoEn) {
        return new PerfilDeUsuario(id, identificadorGoogle, correo, nombre, urlFoto, creadoEn);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private static void requireNonBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be null or blank");
        }
    }
}
