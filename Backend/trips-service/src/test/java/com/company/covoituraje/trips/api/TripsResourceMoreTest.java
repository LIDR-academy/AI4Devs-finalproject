package com.company.covoituraje.trips.api;

import com.company.covoituraje.trips.infrastructure.TripRepository;
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

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
class TripsResourceMoreTest {

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
        TripsResource.AuthContext.setUserId("driver-1");
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

    @AfterEach
    void tearDown() {
        TripsResource.AuthContext.clear();
    }

    private TripCreateDto sampleCreate() {
        TripCreateDto c = new TripCreateDto();
        TripDto.Origin o = new TripDto.Origin();
        o.lat = 1.0; o.lng = 2.0;
        c.origin = o;
        c.destinationSedeId = "SEDE-1";
        c.dateTime = "2025-01-01T08:00:00Z";
        c.seatsTotal = 2;
        return c;
    }

    @Test
    void getById_notFound() {
        assertThrows(jakarta.ws.rs.NotFoundException.class, () -> resource.getById("00000000-0000-0000-0000-000000000001"));
    }

    @Test
    void update_forbidden_whenNotDriver() {
        TripDto created = resource.create(sampleCreate());
        TripsResource.AuthContext.setUserId("driver-2");
        assertThrows(jakarta.ws.rs.ForbiddenException.class, () -> resource.update(created.id, sampleCreate()));
    }

    @Test
    void delete_forbidden_whenNotDriver() {
        TripDto created = resource.create(sampleCreate());
        TripsResource.AuthContext.setUserId("driver-2");
        assertThrows(jakarta.ws.rs.ForbiddenException.class, () -> resource.delete(created.id));
    }
}


