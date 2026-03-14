package com.hexagonal.identity.application.service;

import com.hexagonal.identity.domain.exception.CredencialGoogleInvalidaException;
import com.hexagonal.identity.domain.model.GoogleUserInfo;
import com.hexagonal.identity.domain.model.PerfilDeUsuario;
import com.hexagonal.identity.domain.model.SesionToken;
import com.hexagonal.identity.domain.ports.in.AutenticarConGoogleUseCase.ResultadoAutenticacion;
import com.hexagonal.identity.domain.ports.out.BuscarPerfilPorGoogleIdPort;
import com.hexagonal.identity.domain.ports.out.EmitirTokenSesionPort;
import com.hexagonal.identity.domain.ports.out.PersistirPerfilPort;
import com.hexagonal.identity.domain.ports.out.ValidarCredencialGooglePort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

/**
 * Unit tests for IniciarSesionConGoogleService (TDD — Phase 4).
 *
 * <p>Covers BDD scenarios:</p>
 * <ul>
 *   <li>C1: First access → creates new PerfilDeUsuario, persists it, emits token</li>
 *   <li>C2: Recurring user → recovers existing PerfilDeUsuario, skips persist, emits token</li>
 *   <li>C3: Invalid Google token → CredencialGoogleInvalidaException propagates</li>
 * </ul>
 *
 * <p>All out-ports are mocked; no Spring context loaded.</p>
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("IniciarSesionConGoogleService")
class IniciarSesionConGoogleServiceTest {

    private static final Clock FIXED_CLOCK =
            Clock.fixed(Instant.parse("2026-02-26T10:00:00Z"), ZoneOffset.UTC);

    private static final String VALID_TOKEN = "valid-google-id-token";
    private static final String GOOGLE_SUB = "google-sub-001";
    private static final String EMAIL = "ana@gmail.com";
    private static final String NAME = "Ana García";
    private static final String PHOTO = "https://photo.url/pic.jpg";

    @Mock
    private ValidarCredencialGooglePort validarCredencialGooglePort;

    @Mock
    private BuscarPerfilPorGoogleIdPort buscarPerfilPorGoogleIdPort;

    @Mock
    private PersistirPerfilPort persistirPerfilPort;

    @Mock
    private EmitirTokenSesionPort emitirTokenSesionPort;

    private IniciarSesionConGoogleService service;

    @BeforeEach
    void setUp() {
        service = new IniciarSesionConGoogleService(
                validarCredencialGooglePort,
                buscarPerfilPorGoogleIdPort,
                persistirPerfilPort,
                emitirTokenSesionPort,
                FIXED_CLOCK
        );
    }

    // ─── C1: First access (new user) ──────────────────────────────────────────

    @Nested
    @DisplayName("C1 — primer acceso (usuario nuevo)")
    class PrimerAcceso {

        @Test
        @DisplayName("validar → no existe perfil → crear y persistir → emitir token")
        void primerAcceso_creaYPersistePerfilNuevo_emiteToken() {
            // given
            var userInfo = new GoogleUserInfo(GOOGLE_SUB, EMAIL, NAME, PHOTO);
            var savedPerfil = PerfilDeUsuario.nuevo(GOOGLE_SUB, EMAIL, NAME, PHOTO, FIXED_CLOCK);
            var token = new SesionToken("jwt-token-abc", savedPerfil.id());

            when(validarCredencialGooglePort.validar(VALID_TOKEN)).thenReturn(userInfo);
            when(buscarPerfilPorGoogleIdPort.buscarPorIdentificadorGoogle(GOOGLE_SUB))
                    .thenReturn(Optional.empty());
            when(persistirPerfilPort.persistir(any(PerfilDeUsuario.class))).thenReturn(savedPerfil);
            when(emitirTokenSesionPort.emitir(savedPerfil)).thenReturn(token);

            // when
            ResultadoAutenticacion result = service.autenticar(VALID_TOKEN);

            // then
            assertThat(result).isNotNull();
            assertThat(result.sesionToken()).isEqualTo(token);
            assertThat(result.perfil()).isEqualTo(savedPerfil);

            verify(persistirPerfilPort).persistir(any(PerfilDeUsuario.class));
            verify(emitirTokenSesionPort).emitir(savedPerfil);
        }

        @Test
        @DisplayName("el perfil nuevo tiene el identificadorGoogle correcto")
        void primerAcceso_perfilNuevo_tieneIdentificadorGoogleCorrecto() {
            // given
            var userInfo = new GoogleUserInfo(GOOGLE_SUB, EMAIL, NAME, PHOTO);
            var savedPerfil = PerfilDeUsuario.nuevo(GOOGLE_SUB, EMAIL, NAME, PHOTO, FIXED_CLOCK);
            var token = new SesionToken("jwt-token-abc", savedPerfil.id());

            when(validarCredencialGooglePort.validar(VALID_TOKEN)).thenReturn(userInfo);
            when(buscarPerfilPorGoogleIdPort.buscarPorIdentificadorGoogle(GOOGLE_SUB))
                    .thenReturn(Optional.empty());
            when(persistirPerfilPort.persistir(any(PerfilDeUsuario.class))).thenReturn(savedPerfil);
            when(emitirTokenSesionPort.emitir(any())).thenReturn(token);

            // when
            service.autenticar(VALID_TOKEN);

            // then: the profile passed to persistir has the correct Google sub
            verify(persistirPerfilPort).persistir(
                    argThat(p -> GOOGLE_SUB.equals(p.identificadorGoogle())
                            && EMAIL.equals(p.correo())
                            && NAME.equals(p.nombre()))
            );
        }

        @Test
        @DisplayName("emite token con el perfil devuelto por persistir (no el construido)")
        void primerAcceso_emiteTokenConPerfilPersistido() {
            // given – persistir returns a profile with a different UUID (DB side-effect simulation)
            var userInfo = new GoogleUserInfo(GOOGLE_SUB, EMAIL, NAME, PHOTO);
            var dbPerfil = PerfilDeUsuario.reconocer(UUID.randomUUID(), GOOGLE_SUB, EMAIL, NAME, PHOTO,
                    Instant.parse("2026-02-26T10:00:00Z"));
            var token = new SesionToken("jwt-token-xyz", dbPerfil.id());

            when(validarCredencialGooglePort.validar(VALID_TOKEN)).thenReturn(userInfo);
            when(buscarPerfilPorGoogleIdPort.buscarPorIdentificadorGoogle(GOOGLE_SUB))
                    .thenReturn(Optional.empty());
            when(persistirPerfilPort.persistir(any())).thenReturn(dbPerfil);
            when(emitirTokenSesionPort.emitir(dbPerfil)).thenReturn(token);

            // when
            ResultadoAutenticacion result = service.autenticar(VALID_TOKEN);

            // then: token was issued for the *persisted* profile
            assertThat(result.perfil()).isSameAs(dbPerfil);
            verify(emitirTokenSesionPort).emitir(dbPerfil);
        }
    }

    // ─── C2: Recurring user ───────────────────────────────────────────────────

    @Nested
    @DisplayName("C2 — acceso recurrente (usuario existente)")
    class AccesoRecurrente {

        @Test
        @DisplayName("validar → existe perfil → NO persistir → emitir token")
        void accesoRecurrente_recuperaPerfilExistente_noPersiste_emiteToken() {
            // given
            var userInfo = new GoogleUserInfo(GOOGLE_SUB, EMAIL, NAME, PHOTO);
            var existingPerfil = PerfilDeUsuario.reconocer(UUID.randomUUID(), GOOGLE_SUB, EMAIL, NAME, PHOTO,
                    Instant.parse("2025-01-01T00:00:00Z"));
            var token = new SesionToken("jwt-token-def", existingPerfil.id());

            when(validarCredencialGooglePort.validar(VALID_TOKEN)).thenReturn(userInfo);
            when(buscarPerfilPorGoogleIdPort.buscarPorIdentificadorGoogle(GOOGLE_SUB))
                    .thenReturn(Optional.of(existingPerfil));
            when(emitirTokenSesionPort.emitir(existingPerfil)).thenReturn(token);

            // when
            ResultadoAutenticacion result = service.autenticar(VALID_TOKEN);

            // then
            assertThat(result.perfil()).isEqualTo(existingPerfil);
            assertThat(result.sesionToken()).isEqualTo(token);
            verify(persistirPerfilPort, never()).persistir(any());
        }

        @Test
        @DisplayName("devuelve el perfil existente sin modificar sus datos")
        void accesoRecurrente_devuelvePerfilOriginal_sinModificar() {
            // given
            UUID id = UUID.randomUUID();
            Instant creadoEn = Instant.parse("2025-01-01T00:00:00Z");
            var existingPerfil = PerfilDeUsuario.reconocer(id, GOOGLE_SUB, EMAIL, NAME, null, creadoEn);
            var token = new SesionToken("jwt-token-ghi", id);

            when(validarCredencialGooglePort.validar(VALID_TOKEN))
                    .thenReturn(new GoogleUserInfo(GOOGLE_SUB, EMAIL, NAME, null));
            when(buscarPerfilPorGoogleIdPort.buscarPorIdentificadorGoogle(GOOGLE_SUB))
                    .thenReturn(Optional.of(existingPerfil));
            when(emitirTokenSesionPort.emitir(existingPerfil)).thenReturn(token);

            // when
            ResultadoAutenticacion result = service.autenticar(VALID_TOKEN);

            // then: exactly the existing profile is returned, unmodified
            assertThat(result.perfil().id()).isEqualTo(id);
            assertThat(result.perfil().creadoEn()).isEqualTo(creadoEn);
        }
    }

    // ─── C3: Invalid token ────────────────────────────────────────────────────

    @Nested
    @DisplayName("C3 — credencial Google inválida")
    class CredencialInvalida {

        @Test
        @DisplayName("token inválido → CredencialGoogleInvalidaException se propaga")
        void tokenInvalido_propagaExcepcion() {
            // given
            when(validarCredencialGooglePort.validar(VALID_TOKEN))
                    .thenThrow(new CredencialGoogleInvalidaException("token expired"));

            // when / then
            assertThatThrownBy(() -> service.autenticar(VALID_TOKEN))
                    .isInstanceOf(CredencialGoogleInvalidaException.class)
                    .hasMessageContaining("token expired");

            verifyNoInteractions(buscarPerfilPorGoogleIdPort, persistirPerfilPort, emitirTokenSesionPort);
        }
    }

    // ─── Guard clauses ────────────────────────────────────────────────────────

    @Test
    @DisplayName("idToken nulo → IllegalArgumentException")
    void idTokenNulo_lanzaIllegalArgumentException() {
        assertThatThrownBy(() -> service.autenticar(null))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(validarCredencialGooglePort);
    }

    @Test
    @DisplayName("idToken vacío → IllegalArgumentException")
    void idTokenVacio_lanzaIllegalArgumentException() {
        assertThatThrownBy(() -> service.autenticar("  "))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(validarCredencialGooglePort);
    }
}
