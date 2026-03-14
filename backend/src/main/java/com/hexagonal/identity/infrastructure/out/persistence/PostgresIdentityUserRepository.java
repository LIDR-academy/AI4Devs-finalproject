package com.hexagonal.identity.infrastructure.out.persistence;

import com.hexagonal.identity.domain.model.PerfilDeUsuario;
import com.hexagonal.identity.domain.ports.out.BuscarPerfilPorGoogleIdPort;
import com.hexagonal.identity.domain.ports.out.PersistirPerfilPort;
import com.hexagonal.identity.infrastructure.out.persistence.entity.UserJpaEntity;
import com.hexagonal.identity.infrastructure.out.persistence.repository.JpaUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * PostgreSQL implementation of {@link BuscarPerfilPorGoogleIdPort} and {@link PersistirPerfilPort}.
 *
 * <p>Single adapter implements both out-ports because they share the same JPA repository
 * and the same anti-corruption mapping logic.</p>
 *
 * <p>No domain or business logic here — pure persistence translation.</p>
 */
@Repository
@Transactional
public class PostgresIdentityUserRepository
        implements BuscarPerfilPorGoogleIdPort, PersistirPerfilPort {

    private static final Logger log = LoggerFactory.getLogger(PostgresIdentityUserRepository.class);

    private final JpaUserRepository jpaUserRepository;

    public PostgresIdentityUserRepository(JpaUserRepository jpaUserRepository) {
        this.jpaUserRepository = jpaUserRepository;
    }

    // ─── BuscarPerfilPorGoogleIdPort ──────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Optional<PerfilDeUsuario> buscarPorIdentificadorGoogle(String identificadorGoogle) {
        log.debug("Buscando perfil por Google ID: {}", identificadorGoogle);
        return jpaUserRepository.findByGoogleId(identificadorGoogle)
                .map(this::toDomain);
    }

    // ─── PersistirPerfilPort ──────────────────────────────────────────────────

    @Override
    public PerfilDeUsuario persistir(PerfilDeUsuario perfil) {
        log.info("Persistiendo nuevo perfil de usuario: id={}, googleId={}",
                perfil.id(), perfil.identificadorGoogle());
        UserJpaEntity entity = toEntity(perfil);
        UserJpaEntity saved = jpaUserRepository.save(entity);
        return toDomain(saved);
    }

    // ─── Mapping helpers ──────────────────────────────────────────────────────

    private PerfilDeUsuario toDomain(UserJpaEntity entity) {
        return PerfilDeUsuario.reconocer(
                entity.getId(),
                entity.getGoogleId(),
                entity.getEmail(),
                entity.getNombre(),
                entity.getUrlFoto(),
                entity.getCreatedAt()
        );
    }

    private UserJpaEntity toEntity(PerfilDeUsuario perfil) {
        return new UserJpaEntity(
                perfil.id(),
                perfil.identificadorGoogle(),
                perfil.correo(),
                perfil.nombre(),
                perfil.urlFoto(),
                perfil.creadoEn()
        );
    }
}
