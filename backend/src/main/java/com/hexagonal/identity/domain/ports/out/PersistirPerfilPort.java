package com.hexagonal.identity.domain.ports.out;

import com.hexagonal.identity.domain.model.PerfilDeUsuario;

/**
 * Outbound Port: PersistirPerfilPort
 *
 * <p>Persists a new {@link PerfilDeUsuario} to the database.
 * Only called on first access (C1); returning users (C2) already have a persisted profile.</p>
 *
 * <p>Implemented by the JPA persistence adapter in the infrastructure layer
 * against the {@code identity.users} table.</p>
 */
public interface PersistirPerfilPort {

    /**
     * Saves a new user profile. The profile must have a valid UUID already set.
     *
     * @param perfil the profile to persist
     * @return the persisted profile (may reflect DB-generated values if any)
     */
    PerfilDeUsuario persistir(PerfilDeUsuario perfil);
}
