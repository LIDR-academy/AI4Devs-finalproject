package com.company.covoituraje.trips.integration;

import com.company.covoituraje.trips.domain.Trip;
import com.company.covoituraje.trips.infrastructure.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
class TripRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
            DockerImageName.parse("postgis/postgis:15-3.4").asCompatibleSubstituteFor("postgres"))
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("init-schema.sql");

    private EntityManagerFactory emf;
    private EntityManager em;
    private TripRepository repository;

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
        
        emf = Persistence.createEntityManagerFactory("trips-pu", props);
        em = emf.createEntityManager();
        repository = new TripRepository(em);
    }

    private void createSchema() {
        try (var connection = postgres.createConnection("")) {
            try (var statement = connection.createStatement()) {
                statement.execute("CREATE SCHEMA IF NOT EXISTS trips;");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to create schema", e);
        }
    }

    @Test
    void shouldSaveAndFindTrip() {
        // Given
        Trip trip = new Trip(
            "driver-123",
            "40.4168,-3.7038", // Madrid coordinates
            "SEDE-1",
            OffsetDateTime.now().plusHours(1),
            3,
            Trip.Direction.TO_SEDE
        );

        // When
        Trip savedTrip = repository.save(trip);
        
        // Then
        assertNotNull(savedTrip.getId());
        assertEquals("driver-123", savedTrip.getDriverId());
        assertEquals("40.4168,-3.7038", savedTrip.getOrigin());
        assertEquals("SEDE-1", savedTrip.getDestinationSedeId());
        assertEquals(3, savedTrip.getSeatsTotal());
        assertEquals(3, savedTrip.getSeatsFree());
    }

    @Test
    void shouldFindTripsByDestination() {
        // Given
        Trip trip1 = new Trip("driver-1", "origin1", "SEDE-1", OffsetDateTime.now().plusHours(1), 2, Trip.Direction.TO_SEDE);
        Trip trip2 = new Trip("driver-2", "origin2", "SEDE-2", OffsetDateTime.now().plusHours(2), 3, Trip.Direction.TO_SEDE);
        Trip trip3 = new Trip("driver-3", "origin3", "SEDE-1", OffsetDateTime.now().plusHours(3), 4, Trip.Direction.TO_SEDE);
        
        repository.save(trip1);
        repository.save(trip2);
        repository.save(trip3);

        // When
        List<Trip> sede1Trips = repository.findByDestinationSedeId("SEDE-1");

        // Then
        assertEquals(2, sede1Trips.size());
        assertTrue(sede1Trips.stream().allMatch(t -> "SEDE-1".equals(t.getDestinationSedeId())));
    }

    @Test
    void shouldFindAvailableTrips() {
        // Given
        Trip availableTrip = new Trip("driver-1", "origin1", "SEDE-1", OffsetDateTime.now().plusHours(1), 3, Trip.Direction.TO_SEDE);
        Trip fullTrip = new Trip("driver-2", "origin2", "SEDE-1", OffsetDateTime.now().plusHours(2), 2, Trip.Direction.TO_SEDE);
        fullTrip.reserveSeats(2); // Make it full
        
        repository.save(availableTrip);
        repository.save(fullTrip);

        // When
        List<Trip> availableTrips = repository.findAvailableTrips("SEDE-1");

        // Then
        assertEquals(1, availableTrips.size());
        assertEquals("driver-1", availableTrips.get(0).getDriverId());
        assertTrue(availableTrips.get(0).hasFreeSeats());
    }

    @Test
    void shouldFilterOutPastTripsFromAvailableTrips() {
        // Given
        OffsetDateTime now = OffsetDateTime.now();
        Trip futureTrip = new Trip("driver-1", "origin1", "SEDE-1", now.plusHours(1), 3, Trip.Direction.TO_SEDE);
        Trip pastTrip = new Trip("driver-2", "origin2", "SEDE-1", now.minusHours(1), 2, Trip.Direction.TO_SEDE); // Past trip
        Trip currentTrip = new Trip("driver-3", "origin3", "SEDE-1", now.minusMinutes(30), 2, Trip.Direction.TO_SEDE); // Just started
        
        repository.save(futureTrip);
        repository.save(pastTrip);
        repository.save(currentTrip);

        // When
        List<Trip> availableTrips = repository.findAvailableTrips("SEDE-1");

        // Then
        assertEquals(1, availableTrips.size());
        assertEquals("driver-1", availableTrips.get(0).getDriverId());
        assertTrue(availableTrips.get(0).getDateTime().isAfter(now));
    }

    @Test
    void shouldUpdateTripSeats() {
        // Given
        Trip trip = new Trip("driver-1", "origin1", "SEDE-1", OffsetDateTime.now().plusHours(1), 3, Trip.Direction.TO_SEDE);
        trip = repository.save(trip);

        // When
        trip.reserveSeats(2);
        Trip updatedTrip = repository.save(trip);

        // Then
        assertEquals(1, updatedTrip.getSeatsFree());
        assertEquals(3, updatedTrip.getSeatsTotal());
    }
}
