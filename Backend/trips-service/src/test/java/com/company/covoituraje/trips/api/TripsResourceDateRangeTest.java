package com.company.covoituraje.trips.api;

import com.company.covoituraje.trips.infrastructure.TripRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
class TripsResourceDateRangeTest {

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
    private java.time.OffsetDateTime base;

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

        // Seed three trips at 08:00, 08:30, 09:30 (future day)
        base = java.time.OffsetDateTime.now().plusDays(2).withHour(8).withMinute(0).withSecond(0).withNano(0);
        seedTrip("SEDE-1", base.toString());
        seedTrip("SEDE-1", base.plusMinutes(30).toString());
        seedTrip("SEDE-1", base.plusMinutes(90).toString());
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

    private void seedTrip(String sede, String iso) {
        TripCreateDto c = new TripCreateDto();
        TripCreateDto.Origin o = new TripCreateDto.Origin();
        o.lat = 1.0; o.lng = 2.0;
        c.origin = o;
        c.destinationSedeId = sede;
        c.dateTime = iso;
        c.seatsTotal = 2;
        resource.create(c);
    }

    @Test
    void list_filtersByFromToRange() {
        List<TripDto> list = resource.list("SEDE-1", "08:00", "09:00", null);
        assertEquals(2, list.size());
        assertTrue(list.stream().allMatch(t -> t.destinationSedeId.equals("SEDE-1")));
    }

    @Test
    void list_filtersByFromOnly() {
        List<TripDto> list = resource.list(null, "09:00", null, null);
        assertEquals(1, list.size());
        var expected = base.plusMinutes(90).withSecond(0).withNano(0);
        var actual = java.time.OffsetDateTime.parse(list.get(0).dateTime);
        assertEquals(expected, actual);
    }

    @Test
    void list_filtersByToOnly() {
        List<TripDto> list = resource.list(null, null, "08:15", null);
        assertEquals(1, list.size());
        var expectedStart = base.withSecond(0).withNano(0);
        var actualStart = java.time.OffsetDateTime.parse(list.get(0).dateTime);
        assertEquals(expectedStart, actualStart);
    }

    @Test
    void list_filtersByFullIsoDatetimeRange_withDestination() {
        // add another day outside range
        seedTrip("SEDE-1", base.plusDays(1).withHour(8).withMinute(30).withSecond(0).withNano(0).toString());
        List<TripDto> list = resource.list("SEDE-1", base.plusMinutes(15).toString(), base.plusMinutes(60).toString(), null);
        assertEquals(1, list.size());
        var expectedMid = base.plusMinutes(30).withSecond(0).withNano(0);
        var actualMid = java.time.OffsetDateTime.parse(list.get(0).dateTime);
        assertEquals(expectedMid, actualMid);
    }

    @Test
    void list_filtersByFullIsoDatetimeRange_withoutDestination() {
        List<TripDto> list = resource.list(null, base.toString(), base.plusMinutes(30).toString(), null);
        assertEquals(2, list.size());
    }
}


