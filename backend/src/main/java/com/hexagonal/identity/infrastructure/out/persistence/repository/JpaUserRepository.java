package com.hexagonal.identity.infrastructure.out.persistence.repository;

import com.hexagonal.identity.infrastructure.out.persistence.entity.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link UserJpaEntity}.
 *
 * <p>Used exclusively by {@link com.hexagonal.identity.infrastructure.out.persistence.PostgresIdentityUserRepository}.</p>
 */
public interface JpaUserRepository extends JpaRepository<UserJpaEntity, UUID> {

    /**
     * Finds a user by their stable Google identifier (the {@code sub} claim of the id_token).
     *
     * @param googleId the Google stable user identifier
     * @return the entity, or empty if the user has never logged in
     */
    Optional<UserJpaEntity> findByGoogleId(String googleId);
}
