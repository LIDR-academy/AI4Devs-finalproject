package com.hexagonal.identity.infrastructure.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity for {@code identity.users} table.
 *
 * <p>Infrastructure layer only — never leaks into the domain.
 * Mapping to/from {@link com.hexagonal.identity.domain.model.PerfilDeUsuario}
 * is performed in {@link com.hexagonal.identity.infrastructure.out.persistence.PostgresIdentityUserRepository}.</p>
 */
@Entity
@Table(name = "users", schema = "identity")
public class UserJpaEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "google_id", nullable = false, unique = true, length = 255)
    private String googleId;

    @Column(name = "email", nullable = false, length = 320)
    private String email;

    @Column(name = "nombre", nullable = false, length = 255)
    private String nombre;

    @Column(name = "url_foto", length = 500)
    private String urlFoto;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Required by JPA */
    protected UserJpaEntity() {}

    public UserJpaEntity(UUID id, String googleId, String email, String nombre,
                         String urlFoto, Instant createdAt) {
        this.id = id;
        this.googleId = googleId;
        this.email = email;
        this.nombre = nombre;
        this.urlFoto = urlFoto;
        this.createdAt = createdAt;
    }

    public UUID getId()        { return id; }
    public String getGoogleId() { return googleId; }
    public String getEmail()    { return email; }
    public String getNombre()   { return nombre; }
    public String getUrlFoto()  { return urlFoto; }
    public Instant getCreatedAt() { return createdAt; }
}
