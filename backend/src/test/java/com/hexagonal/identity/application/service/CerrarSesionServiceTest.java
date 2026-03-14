package com.hexagonal.identity.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for CerrarSesionService (TDD — Phase 4).
 *
 * <p>BDD origin: C4 — "Cierre de sesión"
 * MVP implementation: stateless JWT — the service validates the token is present
 * and signals intent. The frontend is responsible for dropping the token.</p>
 */
@DisplayName("CerrarSesionService")
class CerrarSesionServiceTest {

    private CerrarSesionService service;

    @BeforeEach
    void setUp() {
        service = new CerrarSesionService();
    }

    @Test
    @DisplayName("cerrarSesion con token válido no lanza excepción")
    void cerrarSesion_tokenValido_noLanzaExcepcion() {
        assertThatCode(() -> service.cerrarSesion("valid-jwt-token"))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("cerrarSesion con token nulo → IllegalArgumentException")
    void cerrarSesion_tokenNulo_lanzaIllegalArgumentException() {
        assertThatThrownBy(() -> service.cerrarSesion(null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("cerrarSesion con token vacío → IllegalArgumentException")
    void cerrarSesion_tokenVacio_lanzaIllegalArgumentException() {
        assertThatThrownBy(() -> service.cerrarSesion("  "))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
