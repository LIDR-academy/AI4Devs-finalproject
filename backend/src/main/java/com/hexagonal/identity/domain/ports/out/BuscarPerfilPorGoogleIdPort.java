package com.hexagonal.identity.domain.ports.out;

import com.hexagonal.identity.domain.model.PerfilDeUsuario;

import java.util.Optional;

/**
 * Outbound Port: BuscarPerfilPorGoogleIdPort
 *
 * <p>Searches for an existing {@link PerfilDeUsuario} by the Google identifier (sub claim).</p>
 *
 * <p>Returns {@link Optional#empty()} for first-time users (no profile yet).</p>
 *
 * <p>Implemented by the JPA persistence adapter in the infrastructure layer.</p>
 */
public interface BuscarPerfilPorGoogleIdPort {

    /**
     * @param identificadorGoogle the Google stable user identifier (sub claim)
     * @return the existing profile, or empty if the user has never logged in
     */
    Optional<PerfilDeUsuario> buscarPorIdentificadorGoogle(String identificadorGoogle);
}
