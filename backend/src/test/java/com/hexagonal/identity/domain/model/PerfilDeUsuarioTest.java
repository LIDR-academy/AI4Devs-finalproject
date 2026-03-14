package com.hexagonal.identity.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for PerfilDeUsuario aggregate root (TDD — Phase 3).
 *
 * Tests cover:
 * - Factory: nuevo() generates UUID, sets creadoEn from Clock, stores all fields
 * - Factory: reconocer() accepts existing UUID (round-trip)
 * - Invariants: id, identificadorGoogle, correo, nombre must not be null/blank
 * - Immutability: record fields are final/immutable
 * - BDD rule: same identificadorGoogle always maps to same record (equality by id)
 */
class PerfilDeUsuarioTest {

    private static final Clock FIXED_CLOCK =
            Clock.fixed(Instant.parse("2026-02-26T10:00:00Z"), ZoneOffset.UTC);

    // ─── Factory: nuevo() ─────────────────────────────────────────────────────

    @Test
    void nuevo_generatesNewUUID() {
        var perfil = PerfilDeUsuario.nuevo("google-sub-001", "test@gmail.com", "Test User", null, FIXED_CLOCK);

        assertThat(perfil.id()).isNotNull();
        assertThat(perfil.id()).isInstanceOf(UUID.class);
    }

    @Test
    void nuevo_twoCallsProduceDifferentUUIDs() {
        var p1 = PerfilDeUsuario.nuevo("google-sub-001", "test@gmail.com", "Test User", null, FIXED_CLOCK);
        var p2 = PerfilDeUsuario.nuevo("google-sub-001", "test@gmail.com", "Test User", null, FIXED_CLOCK);

        assertThat(p1.id()).isNotEqualTo(p2.id());
    }

    @Test
    void nuevo_setsCreadoEnFromClock() {
        var perfil = PerfilDeUsuario.nuevo("google-sub-001", "test@gmail.com", "Test User", null, FIXED_CLOCK);

        assertThat(perfil.creadoEn()).isEqualTo(Instant.parse("2026-02-26T10:00:00Z"));
    }

    @Test
    void nuevo_storesAllFields() {
        var perfil = PerfilDeUsuario.nuevo("google-sub-XYZ", "ana@gmail.com", "Ana García",
                "https://photo.url/pic.jpg", FIXED_CLOCK);

        assertThat(perfil.identificadorGoogle()).isEqualTo("google-sub-XYZ");
        assertThat(perfil.correo()).isEqualTo("ana@gmail.com");
        assertThat(perfil.nombre()).isEqualTo("Ana García");
        assertThat(perfil.urlFoto()).isEqualTo("https://photo.url/pic.jpg");
    }

    @Test
    void nuevo_acceptsNullUrlFoto() {
        var perfil = PerfilDeUsuario.nuevo("google-sub-001", "test@gmail.com", "Test User", null, FIXED_CLOCK);

        assertThat(perfil.urlFoto()).isNull();
    }

    // ─── Factory: reconocer() — returning user ────────────────────────────────

    @Test
    void reconocer_preservesExistingUUID() {
        UUID existingId = UUID.fromString("550e8400-e29b-41d4-a716-446655440001");
        Instant existingCreadoEn = Instant.parse("2025-01-01T00:00:00Z");

        var perfil = PerfilDeUsuario.reconocer(existingId, "google-sub-001",
                "test@gmail.com", "Test User", null, existingCreadoEn);

        assertThat(perfil.id()).isEqualTo(existingId);
        assertThat(perfil.creadoEn()).isEqualTo(existingCreadoEn);
    }

    // ─── Invariants ───────────────────────────────────────────────────────────

    @Test
    void constructor_throwsWhenIdIsNull() {
        assertThatNullPointerException()
                .isThrownBy(() -> new PerfilDeUsuario(null, "sub", "a@b.com", "Ana", null,
                        Instant.parse("2026-02-26T10:00:00Z")))
                .withMessageContaining("id");
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    void constructor_throwsWhenIdentificadorGoogleIsBlank(String sub) {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> new PerfilDeUsuario(UUID.randomUUID(), sub, "a@b.com", "Ana", null,
                        Instant.parse("2026-02-26T10:00:00Z")));
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    void constructor_throwsWhenCorreoIsBlank(String correo) {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> new PerfilDeUsuario(UUID.randomUUID(), "sub", correo, "Ana", null,
                        Instant.parse("2026-02-26T10:00:00Z")));
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    void constructor_throwsWhenNombreIsBlank(String nombre) {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> new PerfilDeUsuario(UUID.randomUUID(), "sub", "a@b.com", nombre, null,
                        Instant.parse("2026-02-26T10:00:00Z")));
    }

    @Test
    void constructor_throwsWhenCreadoEnIsNull() {
        assertThatNullPointerException()
                .isThrownBy(() -> new PerfilDeUsuario(UUID.randomUUID(), "sub", "a@b.com", "Ana", null, null))
                .withMessageContaining("creadoEn");
    }

    // ─── Equality & BDD rule ──────────────────────────────────────────────────

    @Test
    void equality_sameIdMeansSameProfile() {
        UUID id = UUID.randomUUID();
        Instant now = Instant.now(FIXED_CLOCK);

        var p1 = new PerfilDeUsuario(id, "sub", "a@b.com", "Ana", null, now);
        var p2 = new PerfilDeUsuario(id, "sub", "a@b.com", "Ana", null, now);

        assertThat(p1).isEqualTo(p2);
    }
}
