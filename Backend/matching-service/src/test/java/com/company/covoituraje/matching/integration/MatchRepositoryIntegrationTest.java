package com.company.covoituraje.matching.integration;

import com.company.covoituraje.matching.domain.Match;
import com.company.covoituraje.matching.infrastructure.MatchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.time.Duration;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
class MatchRepositoryIntegrationTest {

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
        
        emf = Persistence.createEntityManagerFactory("matches-pu", props);
        em = emf.createEntityManager();
        repository = new MatchRepository(em);
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

    @Test
    void shouldSaveAndFindMatch() {
        // Given
        UUID tripId = UUID.randomUUID();
        Match match = new Match(tripId, "passenger-456", "driver-123", BigDecimal.valueOf(0.85), "SUGGESTED");

        // When
        Match savedMatch = repository.save(match);
        
        // Then
        assertNotNull(savedMatch.getId());
        assertEquals(tripId, savedMatch.getTripId());
        assertEquals("driver-123", savedMatch.getDriverId());
        assertEquals("passenger-456", savedMatch.getPassengerId());
        assertEquals(BigDecimal.valueOf(0.85), savedMatch.getMatchScore());
        assertEquals("SUGGESTED", savedMatch.getStatus());
    }

    @Test
    void shouldFindMatchesByTrip() {
        // Given
        UUID tripId1 = UUID.randomUUID();
        UUID tripId2 = UUID.randomUUID();
        Match match1 = new Match(tripId1, "passenger-1", "driver-1", BigDecimal.valueOf(0.9), "SUGGESTED");
        Match match2 = new Match(tripId1, "passenger-2", "driver-1", BigDecimal.valueOf(0.7), "ACCEPTED");
        Match match3 = new Match(tripId2, "passenger-1", "driver-2", BigDecimal.valueOf(0.8), "SUGGESTED");
        
        repository.save(match1);
        repository.save(match2);
        repository.save(match3);

        // When
        List<Match> tripMatches = repository.findByTripId(tripId1);

        // Then
        assertEquals(2, tripMatches.size());
        assertTrue(tripMatches.stream().allMatch(m -> tripId1.equals(m.getTripId())));
    }

    @Test
    void shouldFindMatchesByPassenger() {
        // Given
        Match match1 = new Match(UUID.randomUUID(), "passenger-123", "driver-1", BigDecimal.valueOf(0.9), "SUGGESTED");
        Match match2 = new Match(UUID.randomUUID(), "passenger-456", "driver-2", BigDecimal.valueOf(0.7), "ACCEPTED");
        Match match3 = new Match(UUID.randomUUID(), "passenger-123", "driver-3", BigDecimal.valueOf(0.8), "SUGGESTED");
        
        repository.save(match1);
        repository.save(match2);
        repository.save(match3);

        // When
        List<Match> passengerMatches = repository.findByPassengerId("passenger-123");

        // Then
        assertEquals(2, passengerMatches.size());
        assertTrue(passengerMatches.stream().allMatch(m -> "passenger-123".equals(m.getPassengerId())));
    }

    @Test
    void shouldFindMatchesByDriver() {
        // Given
        Match match1 = new Match(UUID.randomUUID(), "passenger-1", "driver-123", BigDecimal.valueOf(0.9), "SUGGESTED");
        Match match2 = new Match(UUID.randomUUID(), "passenger-2", "driver-456", BigDecimal.valueOf(0.7), "ACCEPTED");
        Match match3 = new Match(UUID.randomUUID(), "passenger-3", "driver-123", BigDecimal.valueOf(0.8), "SUGGESTED");
        
        repository.save(match1);
        repository.save(match2);
        repository.save(match3);

        // When
        List<Match> driverMatches = repository.findByDriverId("driver-123");

        // Then
        assertEquals(2, driverMatches.size());
        assertTrue(driverMatches.stream().allMatch(m -> "driver-123".equals(m.getDriverId())));
    }

    @Test
    void shouldFindMatchesByStatus() {
        // Given
        Match match1 = new Match(UUID.randomUUID(), "passenger-1", "driver-1", BigDecimal.valueOf(0.9), "SUGGESTED");
        Match match2 = new Match(UUID.randomUUID(), "passenger-2", "driver-2", BigDecimal.valueOf(0.7), "ACCEPTED");
        Match match3 = new Match(UUID.randomUUID(), "passenger-3", "driver-3", BigDecimal.valueOf(0.8), "SUGGESTED");
        
        repository.save(match1);
        repository.save(match2);
        repository.save(match3);

        // When
        List<Match> suggestedMatches = repository.findByStatus("SUGGESTED");

        // Then
        assertEquals(2, suggestedMatches.size());
        assertTrue(suggestedMatches.stream().allMatch(m -> "SUGGESTED".equals(m.getStatus())));
    }

    @Test
    void shouldFindHighScoreMatches() {
        // Given
        Match match1 = new Match(UUID.randomUUID(), "passenger-1", "driver-1", BigDecimal.valueOf(0.9), "SUGGESTED");
        Match match2 = new Match(UUID.randomUUID(), "passenger-2", "driver-2", BigDecimal.valueOf(0.7), "SUGGESTED");
        Match match3 = new Match(UUID.randomUUID(), "passenger-3", "driver-3", BigDecimal.valueOf(0.8), "SUGGESTED");
        
        repository.save(match1);
        repository.save(match2);
        repository.save(match3);

        // When
        List<Match> highScoreMatches = repository.findHighScoreMatches(BigDecimal.valueOf(0.8));

        // Then
        assertEquals(2, highScoreMatches.size());
        assertTrue(highScoreMatches.stream().allMatch(m -> m.getMatchScore().compareTo(BigDecimal.valueOf(0.8)) >= 0));
    }

    @Test
    void shouldFindMatchByTripAndPassenger() {
        // Given
        UUID tripId = UUID.randomUUID();
        Match match1 = new Match(tripId, "passenger-123", "driver-1", BigDecimal.valueOf(0.9), "SUGGESTED");
        Match match2 = new Match(tripId, "passenger-456", "driver-1", BigDecimal.valueOf(0.7), "SUGGESTED");
        Match match3 = new Match(UUID.randomUUID(), "passenger-123", "driver-2", BigDecimal.valueOf(0.8), "SUGGESTED");
        
        repository.save(match1);
        repository.save(match2);
        repository.save(match3);

        // When
        List<Match> specificMatches = repository.findByTripIdAndPassengerId(tripId, "passenger-123");

        // Then
        assertEquals(1, specificMatches.size());
        assertEquals(tripId, specificMatches.get(0).getTripId());
        assertEquals("passenger-123", specificMatches.get(0).getPassengerId());
    }

    @Test
    void shouldUpdateMatchStatus() {
        // Given
        Match match = new Match(UUID.randomUUID(), "passenger-456", "driver-123", BigDecimal.valueOf(0.85), "SUGGESTED");
        match = repository.save(match);

        // When
        match.accept();
        Match updatedMatch = repository.save(match);

        // Then
        assertEquals("ACCEPTED", updatedMatch.getStatus());
        assertTrue(updatedMatch.isAccepted());
    }
}
