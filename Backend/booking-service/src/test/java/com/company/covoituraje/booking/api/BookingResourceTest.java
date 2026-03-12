package com.company.covoituraje.booking.api;

import com.company.covoituraje.booking.infrastructure.BookingRepository;
import com.company.covoituraje.booking.integration.TripsServiceClient;
import com.company.covoituraje.booking.integration.UsersServiceClient;
import com.company.covoituraje.booking.service.BookingValidationService;
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

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

@Testcontainers
class BookingResourceTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("init-schema.sql")
            .withStartupTimeout(Duration.ofMinutes(2));

    private EntityManagerFactory emf;
    private EntityManager em;

    private BookingResource resource;

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

        emf = Persistence.createEntityManagerFactory("bookings-pu", props);
        em = emf.createEntityManager();
        BookingRepository repository = new BookingRepository(em);

        TripsServiceClient tripsServiceClient = Mockito.mock(TripsServiceClient.class);
        UsersServiceClient usersServiceClient = Mockito.mock(UsersServiceClient.class);
        when(usersServiceClient.userExists("test-user-001")).thenReturn(true);
        try { when(tripsServiceClient.hasAvailableSeats(any(), anyInt())).thenReturn(true); } catch (Exception ignored) {}

        BookingValidationService validationService = new BookingValidationService(tripsServiceClient, usersServiceClient);
        resource = new BookingResource(repository, validationService);

        BookingResource.AuthContext.setUserId("test-user-001");
    }

    private void createSchema() {
        try (var connection = postgres.createConnection("")) {
            try (var statement = connection.createStatement()) {
                statement.execute("CREATE SCHEMA IF NOT EXISTS bookings;");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to create schema", e);
        }
    }

    @Test
    void post_createsBooking() throws Exception {
        BookingResource.BookingCreateDto req = new BookingResource.BookingCreateDto();
        req.tripId = "550e8400-e29b-41d4-a716-446655440001";
        req.seatsRequested = 1;

        BookingDto dto = resource.create(req);

        assertNotNull(dto.id);
        assertEquals(req.tripId, dto.tripId);
        assertEquals("test-user-001", dto.passengerId);
        assertEquals(1, dto.seatsRequested);
        assertEquals("PENDING", dto.status);
    }

    @Test
    void get_returnsList() {
        List<BookingDto> list = resource.listMine(null, null, null);
        assertNotNull(list);
        assertTrue(list.isEmpty());
    }
}
