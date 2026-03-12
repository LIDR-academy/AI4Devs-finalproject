package com.company.covoituraje.trips.api;

import com.company.covoituraje.trips.infrastructure.TripRepository;
import com.company.covoituraje.trips.domain.Trip;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
class TripsResourceTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
            DockerImageName.parse("postgis/postgis:15-3.4").asCompatibleSubstituteFor("postgres"))
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("init-schema.sql");

    private EntityManagerFactory emf;
    private EntityManager em;

    private TripsResource resource;

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

        emf = Persistence.createEntityManagerFactory("trips-pu", props);
        em = emf.createEntityManager();
        TripRepository repo = new TripRepository(em);
        resource = new TripsResource(repo);
        // Set up test user context
        TripsResource.AuthContext.setUserId("test-user-001");
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
    void post_createsTripAndReturnsEntity() {
        TripCreateDto create = new TripCreateDto();
        TripDto.Origin origin = new TripDto.Origin();
        origin.lat = 40.4168;
        origin.lng = -3.7038;
        create.origin = origin;
        create.destinationSedeId = "SEDE-1";
        create.dateTime = "2025-10-06T08:30:00+00:00";
        create.seatsTotal = 3;

        TripDto body = resource.create(create);
        assertEquals("SEDE-1", body.destinationSedeId);
        assertEquals(3, body.seatsTotal);
        assertEquals(3, body.seatsFree);
        assertNotNull(body.id);
        assertEquals("test-user-001", body.driverId);
    }

    @Test
    void get_returnsList() {
        List<TripDto> list = resource.list("SEDE-1", "08:00", "09:00", null);
        assertNotNull(list);
        assertTrue(list.isEmpty());
    }

    @Test
    void updateTrip_seatsTotal_recalculatesSeatsFree() {
        // Given: Create a trip with 4 total seats, 2 free (2 occupied)
        TripCreateDto create = new TripCreateDto();
        TripDto.Origin origin = new TripDto.Origin();
        origin.lat = 40.4168;
        origin.lng = -3.7038;
        create.origin = origin;
        create.destinationSedeId = "SEDE-1";
        create.dateTime = "2025-10-06T08:30:00+00:00";
        create.seatsTotal = 4;

        TripDto createdTrip = resource.create(create);
        assertEquals(4, createdTrip.seatsTotal);
        assertEquals(4, createdTrip.seatsFree);

        // Simulate some seats being occupied (2 seats reserved)
        // In real scenario, this would happen through booking service
        Trip trip = em.find(Trip.class, UUID.fromString(createdTrip.id));
        assertNotNull(trip);
        trip.reserveSeats(2); // Reserve 2 seats
        em.getTransaction().begin();
        em.merge(trip);
        em.getTransaction().commit();

        // When: Update seatsTotal to 5 (add 1 more seat)
        TripCreateDto update = new TripCreateDto();
        update.seatsTotal = 5;
        TripDto updatedTrip = resource.update(createdTrip.id, update);

        // Then: seatsTotal should be 5, seatsFree should be 3 (5 total - 2 occupied)
        assertEquals(5, updatedTrip.seatsTotal);
        assertEquals(3, updatedTrip.seatsFree);
    }
}
