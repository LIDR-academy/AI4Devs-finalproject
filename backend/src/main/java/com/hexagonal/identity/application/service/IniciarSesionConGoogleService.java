package com.hexagonal.identity.application.service;

import com.hexagonal.identity.domain.model.PerfilDeUsuario;
import com.hexagonal.identity.domain.model.SesionToken;
import com.hexagonal.identity.domain.ports.in.AutenticarConGoogleUseCase;
import com.hexagonal.identity.domain.ports.out.BuscarPerfilPorGoogleIdPort;
import com.hexagonal.identity.domain.ports.out.EmitirTokenSesionPort;
import com.hexagonal.identity.domain.ports.out.PersistirPerfilPort;
import com.hexagonal.identity.domain.ports.out.ValidarCredencialGooglePort;

import java.time.Clock;
import java.util.Objects;

/**
 * Application Service: IniciarSesionConGoogleService
 *
 * <p>Implements {@link AutenticarConGoogleUseCase}. Pure orchestration — no business logic.</p>
 *
 * <p>Flow:</p>
 * <ol>
 *   <li>Validate the Google id_token via {@link ValidarCredencialGooglePort#validar(String)}</li>
 *   <li>Look up an existing profile via {@link BuscarPerfilPorGoogleIdPort}</li>
 *   <li>C1 (new user): build a new {@link PerfilDeUsuario} and persist it via
 *       {@link PersistirPerfilPort}</li>
 *   <li>C2 (returning user): use the existing profile directly</li>
 *   <li>Issue a session JWT via {@link EmitirTokenSesionPort}</li>
 *   <li>Return {@link ResultadoAutenticacion} with the token and resolved profile</li>
 * </ol>
 *
 * <p>No Spring annotations — wired by the infrastructure configuration bean.</p>
 */
public class IniciarSesionConGoogleService implements AutenticarConGoogleUseCase {

    private final ValidarCredencialGooglePort validarCredencialGooglePort;
    private final BuscarPerfilPorGoogleIdPort buscarPerfilPorGoogleIdPort;
    private final PersistirPerfilPort persistirPerfilPort;
    private final EmitirTokenSesionPort emitirTokenSesionPort;
    private final Clock clock;

    public IniciarSesionConGoogleService(
            ValidarCredencialGooglePort validarCredencialGooglePort,
            BuscarPerfilPorGoogleIdPort buscarPerfilPorGoogleIdPort,
            PersistirPerfilPort persistirPerfilPort,
            EmitirTokenSesionPort emitirTokenSesionPort,
            Clock clock) {
        this.validarCredencialGooglePort = Objects.requireNonNull(
                validarCredencialGooglePort, "validarCredencialGooglePort is required");
        this.buscarPerfilPorGoogleIdPort = Objects.requireNonNull(
                buscarPerfilPorGoogleIdPort, "buscarPerfilPorGoogleIdPort is required");
        this.persistirPerfilPort = Objects.requireNonNull(
                persistirPerfilPort, "persistirPerfilPort is required");
        this.emitirTokenSesionPort = Objects.requireNonNull(
                emitirTokenSesionPort, "emitirTokenSesionPort is required");
        this.clock = Objects.requireNonNull(clock, "clock is required");
    }

    /**
     * {@inheritDoc}
     *
     * @throws IllegalArgumentException if {@code idToken} is null or blank
     * @throws com.hexagonal.identity.domain.exception.CredencialGoogleInvalidaException
     *         if the Google token is invalid (propagated from the validator port)
     */
    @Override
    public ResultadoAutenticacion autenticar(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new IllegalArgumentException("idToken must not be null or blank");
        }

        // Step 1 — validate Google token → extract user info
        var userInfo = validarCredencialGooglePort.validar(idToken);

        // Step 2 — find or create profile
        var perfilExistente = buscarPerfilPorGoogleIdPort
                .buscarPorIdentificadorGoogle(userInfo.identificadorGoogle());

        PerfilDeUsuario perfil = perfilExistente.orElseGet(() -> {
            // C1: first-time user — create and persist
            var nuevoPerfil = PerfilDeUsuario.nuevo(
                    userInfo.identificadorGoogle(),
                    userInfo.correo(),
                    userInfo.nombre(),
                    userInfo.urlFoto(),
                    clock
            );
            return persistirPerfilPort.persistir(nuevoPerfil);
        });

        // Step 3 — issue session token
        SesionToken sesionToken = emitirTokenSesionPort.emitir(perfil);

        return new ResultadoAutenticacion(sesionToken, perfil);
    }
}
