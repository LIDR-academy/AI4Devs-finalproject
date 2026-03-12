package com.company.covoituraje.users.api;

import com.company.covoituraje.users.domain.User;
import com.company.covoituraje.users.infrastructure.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
class UsersResourceMoreTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
            DockerImageName.parse("postgis/postgis:15-3.4").asCompatibleSubstituteFor("postgres"))
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("init-schema.sql");

    private EntityManagerFactory emf;
    private EntityManager em;

    private UsersResource resource;
    private UserRepository setupRepo;

    @BeforeEach
    void setUp() {
        createSchema();

        var props = new java.util.Properties();
        props.setProperty("jakarta.persistence.jdbc.driver", "org.postgresql.Driver");
        props.setProperty("jakarta.persistence.jdbc.url", postgres.getJdbcUrl());
        props.setProperty("jakarta.persistence.jdbc.user", postgres.getUsername());
        props.setProperty("jakarta.persistence.jdbc.password", postgres.getPassword());
        props.setProperty("hibernate.hbm2ddl.auto", "create");
        props.setProperty("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");

        emf = Persistence.createEntityManagerFactory("users-pu", props);
        em = emf.createEntityManager();
        setupRepo = new UserRepository(em);
        resource = new UsersResource(setupRepo);

        setupRepo.save(new User("user-1", "User 1", "u1@company.com", "SEDE-1", "EMPLOYEE"));
        setupRepo.save(new User("user-2", "User 2", "u2@company.com", "SEDE-2", "EMPLOYEE"));
        setupRepo.save(new User("user-3", "User 3", "u3@company.com", "SEDE-1", "ADMIN"));
    }

    private void createSchema() {
        try (var connection = postgres.createConnection("")) {
            try (var statement = connection.createStatement()) {
                statement.execute("CREATE SCHEMA IF NOT EXISTS users;");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to create schema", e);
        }
    }

    @AfterEach
    void tearDown() {
        UsersResource.AuthContext.clear();
    }

    @Test
    void list_bySede_filters() {
        List<UserDto> list = resource.list("SEDE-1", null, "en");
        assertEquals(2, list.size());
        assertTrue(list.stream().allMatch(u -> "SEDE-1".equals(u.sedeId)));
    }

    @Test
    void list_byRole_filters() {
        List<UserDto> list = resource.list(null, "EMPLOYEE", "en");
        assertEquals(2, list.size());
        assertTrue(list.stream().allMatch(u -> u.roles.contains("EMPLOYEE")));
    }

    @Test
    void getById_notFound() {
        assertThrows(jakarta.ws.rs.NotFoundException.class, () -> resource.getById("missing", "en"));
    }

    @Test
    void getMe_missingUserId_badRequest() {
        UsersResource.AuthContext.clear();
        assertThrows(jakarta.ws.rs.BadRequestException.class, () -> resource.getMe("en"));
    }
}


