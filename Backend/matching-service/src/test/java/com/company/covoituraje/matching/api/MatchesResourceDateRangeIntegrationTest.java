package com.company.covoituraje.matching.api;

import com.company.covoituraje.matching.infrastructure.MatchRepository;
import com.company.covoituraje.matching.integration.TripsServiceClient;
import com.company.covoituraje.matching.service.MatchingService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
class MatchesResourceDateRangeIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("init-schema.sql")
            .withStartupTimeout(Duration.ofMinutes(2));

    private EntityManagerFactory emf;
    private EntityManager em;
    private MatchRepository repository;
    private MatchesResource resource;

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

        emf = Persistence.createEntityManagerFactory("matches-pu", props);
        em = emf.createEntityManager();
        repository = new MatchRepository(em);
        TripsServiceClient tripsClient = Mockito.mock(TripsServiceClient.class);
        MatchingService svc = new MatchingService(repository, tripsClient);
        resource = new MatchesResource(svc, repository);

        // Seed matches for passenger user-1 at different createdAt times
        seedMatch("user-1", "driver-a", iso("2025-01-01T08:00:00Z"));
        seedMatch("user-1", "driver-a", iso("2025-01-01T08:30:00Z"));
        seedMatch("user-1", "driver-a", iso("2025-01-01T09:30:00Z"));

        // Seed driver matches for driver-1
        seedMatch("user-x", "driver-1", iso("2025-01-01T08:05:00Z"));
        seedMatch("user-x", "driver-1", iso("2025-01-01T10:00:00Z"));
    }

    private void createSchema() {
        try (var connection = postgres.createConnection("")) {
            try (var statement = connection.createStatement()) {
                statement.execute("CREATE SCHEMA IF NOT EXISTS matches;");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to create schema", e);
        }
    }

    private OffsetDateTime iso(String s) {
        return OffsetDateTime.parse(s, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }

    private void seedMatch(String passengerId, String driverId, OffsetDateTime createdAt) {
        com.company.covoituraje.matching.domain.Match m = new com.company.covoituraje.matching.domain.Match(
                UUID.randomUUID(), passengerId, driverId, new BigDecimal("0.75"), "PENDING");
        m.setCreatedAt(createdAt);
        repository.save(m);
    }

    @Test
    void myMatches_filtersByCreatedAtRange() {
        MatchesResource.AuthContext.setUserId("user-1");
        List<MatchDto> list = resource.getMyMatches("2025-01-01T08:15:00Z", "2025-01-01T09:00:00Z", "en");
        assertEquals(1, list.size());
    }

    @Test
    void driverMatches_filtersByCreatedAtRange() {
        MatchesResource.AuthContext.setUserId("driver-1");
        List<MatchDto> list = resource.getDriverMatches("driver-1", "2025-01-01T08:00:00Z", "2025-01-01T09:00:00Z", "en");
        assertEquals(1, list.size());
    }
}


