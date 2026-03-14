package com.hexagonal.identity.infrastructure.out.persistence;

import com.hexagonal.identity.domain.model.PerfilDeUsuario;
import com.hexagonal.meditationbuilder.MeditationBuilderApplication;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test for {@link PostgresIdentityUserRepository}.
 *
 * <p>Uses Testcontainers PostgreSQL with Flyway to verify the persistence adapter against a real
 * database, including the {@code identity.users} schema and indexes.</p>
 *
 * <p>Covers:</p>
 * <ul>
 *   <li>Persisting a new user profile (C1: primer acceso)</li>
 *   <li>Finding a user by Google ID (C2: acceso recurrente)</li>
 *   <li>Returning empty when user does not exist</li>
 *   <li>Round-trip: persist then find returns identical data</li>
 * </ul>
 */
@SpringBootTest(classes = MeditationBuilderApplication.class)
@Testcontainers
@ActiveProfiles("test")
@DisplayName("PostgresIdentityUserRepository — Integration Tests")
class PostgresIdentityUserRepositoryIT {

    private static final Clock FIXED_CLOCK =
            Clock.fixed(Instant.parse("2026-02-26T10:00:00Z"), ZoneOffset.UTC);

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("meditation_builder_it")
            .withUsername("testuser")
            .withPassword("testpass");

    static {
        postgres.start();
    }

    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
        registry.add("spring.flyway.enabled", () -> "true");
    }

    @Autowired
    private PostgresIdentityUserRepository adapter;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanUp() {
        jdbcTemplate.execute("DELETE FROM identity.users");
    }

    // ─── BuscarPerfilPorGoogleIdPort ──────────────────────────────────────────

    @Nested
    @DisplayName("buscarPorIdentificadorGoogle")
    class BuscarPorIdentificadorGoogle {

        @Test
        @DisplayName("devuelve empty para usuario inexistente")
        void usuarioInexistente_devuelveEmpty() {
            Optional<PerfilDeUsuario> result =
                    adapter.buscarPorIdentificadorGoogle("unknown-google-sub");

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("devuelve el perfil cuando existe")
        void usuarioExistente_devuelvePerfil() {
            // given
            PerfilDeUsuario original = PerfilDeUsuario.nuevo(
                    "google-sub-it-001", "it@test.com", "IT User", null, FIXED_CLOCK);
            adapter.persistir(original);

            // when
            Optional<PerfilDeUsuario> found =
                    adapter.buscarPorIdentificadorGoogle("google-sub-it-001");

            // then
            assertThat(found).isPresent();
            assertThat(found.get().identificadorGoogle()).isEqualTo("google-sub-it-001");
            assertThat(found.get().correo()).isEqualTo("it@test.com");
            assertThat(found.get().nombre()).isEqualTo("IT User");
            assertThat(found.get().urlFoto()).isNull();
        }
    }

    // ─── PersistirPerfilPort ──────────────────────────────────────────────────

    @Nested
    @DisplayName("persistir")
    class Persistir {

        @Test
        @DisplayName("persiste y devuelve el perfil con todos sus campos")
        void persistir_almacenaTodosLosCampos() {
            // given
            PerfilDeUsuario perfil = PerfilDeUsuario.nuevo(
                    "google-sub-it-002", "user2@test.com", "User Two",
                    "https://photo.url/pic.jpg", FIXED_CLOCK);

            // when
            PerfilDeUsuario saved = adapter.persistir(perfil);

            // then
            assertThat(saved.id()).isNotNull();
            assertThat(saved.identificadorGoogle()).isEqualTo("google-sub-it-002");
            assertThat(saved.correo()).isEqualTo("user2@test.com");
            assertThat(saved.nombre()).isEqualTo("User Two");
            assertThat(saved.urlFoto()).isEqualTo("https://photo.url/pic.jpg");
            assertThat(saved.creadoEn()).isEqualTo(Instant.parse("2026-02-26T10:00:00Z"));
        }

        @Test
        @DisplayName("round-trip: persistir luego buscar devuelve datos idénticos")
        void roundTrip_persistirLuegoBuscar_devuelveDatosIdenticos() {
            // given
            UUID expectedId = UUID.randomUUID();
            PerfilDeUsuario perfil = PerfilDeUsuario.reconocer(
                    expectedId, "google-sub-it-003", "rtrip@test.com", "Round Trip",
                    null, Instant.parse("2026-02-26T10:00:00Z"));

            // when
            adapter.persistir(perfil);
            Optional<PerfilDeUsuario> found =
                    adapter.buscarPorIdentificadorGoogle("google-sub-it-003");

            // then
            assertThat(found).isPresent();
            assertThat(found.get().id()).isEqualTo(expectedId);
            assertThat(found.get().correo()).isEqualTo("rtrip@test.com");
        }
    }
}
