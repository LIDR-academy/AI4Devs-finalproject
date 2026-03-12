package com.company.covoituraje.users.integration;

import com.company.covoituraje.users.domain.User;
import com.company.covoituraje.users.infrastructure.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
class UserRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
            DockerImageName.parse("postgis/postgis:15-3.4").asCompatibleSubstituteFor("postgres"))
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("init-schema.sql");

    private EntityManagerFactory emf;
    private EntityManager em;
    private UserRepository repository;

    @BeforeEach
    void setUp() {
        // Create schema
        createSchema();
        
        // Create EntityManagerFactory with test container connection
        var props = new java.util.Properties();
        props.setProperty("jakarta.persistence.jdbc.driver", "org.postgresql.Driver");
        props.setProperty("jakarta.persistence.jdbc.url", postgres.getJdbcUrl());
        props.setProperty("jakarta.persistence.jdbc.user", postgres.getUsername());
        props.setProperty("jakarta.persistence.jdbc.password", postgres.getPassword());
        props.setProperty("hibernate.hbm2ddl.auto", "create");
        props.setProperty("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        
        emf = Persistence.createEntityManagerFactory("users-pu", props);
        em = emf.createEntityManager();
        repository = new UserRepository(em);
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

    @Test
    void shouldSaveAndFindUser() {
        // Given
        User user = new User(
            "user-123",
            "John Doe",
            "john.doe@company.com",
            "SEDE-1",
            "EMPLOYEE"
        );

        // When
        User savedUser = repository.save(user);
        
        // Then
        assertNotNull(savedUser.getId());
        assertEquals("user-123", savedUser.getId());
        assertEquals("John Doe", savedUser.getName());
        assertEquals("john.doe@company.com", savedUser.getEmail());
        assertEquals("SEDE-1", savedUser.getSedeId());
        assertEquals("EMPLOYEE", savedUser.getRole());
    }

    @Test
    void shouldFindUsersBySede() {
        // Given
        User user1 = new User("user-1", "User 1", "user1@company.com", "SEDE-1", "EMPLOYEE");
        User user2 = new User("user-2", "User 2", "user2@company.com", "SEDE-2", "EMPLOYEE");
        User user3 = new User("user-3", "User 3", "user3@company.com", "SEDE-1", "ADMIN");
        
        repository.save(user1);
        repository.save(user2);
        repository.save(user3);

        // When
        List<User> sede1Users = repository.findBySedeId("SEDE-1");

        // Then
        assertEquals(2, sede1Users.size());
        assertTrue(sede1Users.stream().allMatch(u -> "SEDE-1".equals(u.getSedeId())));
    }

    @Test
    void shouldFindUsersByRole() {
        // Given
        User user1 = new User("user-1", "User 1", "user1@company.com", "SEDE-1", "EMPLOYEE");
        User user2 = new User("user-2", "User 2", "user2@company.com", "SEDE-1", "ADMIN");
        User user3 = new User("user-3", "User 3", "user3@company.com", "SEDE-2", "EMPLOYEE");
        
        repository.save(user1);
        repository.save(user2);
        repository.save(user3);

        // When
        List<User> employees = repository.findByRole("EMPLOYEE");

        // Then
        assertEquals(2, employees.size());
        assertTrue(employees.stream().allMatch(u -> "EMPLOYEE".equals(u.getRole())));
    }

    @Test
    void shouldUpdateUser() {
        // Given
        User user = new User("user-123", "John Doe", "john.doe@company.com", "SEDE-1", "EMPLOYEE");
        user = repository.save(user);

        // When
        user.updateProfile("John Updated", "john.updated@company.com", "SEDE-2");
        User updatedUser = repository.save(user);

        // Then
        assertEquals("John Updated", updatedUser.getName());
        assertEquals("john.updated@company.com", updatedUser.getEmail());
        assertEquals("SEDE-2", updatedUser.getSedeId());
    }

    @Test
    void shouldFindUserById() {
        // Given
        User user = new User("user-123", "John Doe", "john.doe@company.com", "SEDE-1", "EMPLOYEE");
        repository.save(user);

        // When
        Optional<User> foundUser = repository.findById("user-123");

        // Then
        assertTrue(foundUser.isPresent());
        assertEquals("user-123", foundUser.get().getId());
        assertEquals("John Doe", foundUser.get().getName());
    }
}
