package com.company.covoituraje.booking.api;

import com.company.covoituraje.booking.infrastructure.BookingRepository;
import com.company.covoituraje.booking.integration.TripsServiceClient;
import com.company.covoituraje.booking.integration.UsersServiceClient;
import com.company.covoituraje.booking.service.BookingValidationService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

@Testcontainers
class BookingResourceMoreTest {

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

        // Mock cross-service validation
        TripsServiceClient tripsClient = Mockito.mock(TripsServiceClient.class);
        UsersServiceClient usersClient = Mockito.mock(UsersServiceClient.class);
        when(usersClient.userExists(any())).thenReturn(true);
        try { when(tripsClient.hasAvailableSeats(any(), anyInt())).thenReturn(true); } catch (Exception ignored) {}

        BookingValidationService validation = new BookingValidationService(tripsClient, usersClient);
        resource = new BookingResource(repository, validation);

        BookingResource.AuthContext.setUserId("user-A");
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

    @AfterEach
    void tearDown() {
        BookingResource.AuthContext.clear();
    }

    @Test
    void getById_forbidden_whenOtherUser() {
        BookingResource.BookingCreateDto req = new BookingResource.BookingCreateDto();
        req.tripId = java.util.UUID.randomUUID().toString();
        req.seatsRequested = 1;
        BookingDto created = resource.create(req);

        BookingResource.AuthContext.setUserId("user-B");
        assertThrows(jakarta.ws.rs.ForbiddenException.class, () -> resource.getById(created.id));
    }

    @Test
    void getById_invalidId_badRequest() {
        assertThrows(jakarta.ws.rs.BadRequestException.class, () -> resource.getById("not-a-uuid"));
    }

    @Test
    void getById_notFound() {
        String missing = java.util.UUID.randomUUID().toString();
        assertThrows(jakarta.ws.rs.NotFoundException.class, () -> resource.getById(missing));
    }

    @Test
    void confirm_and_cancel_transitions() {
        BookingResource.BookingCreateDto req = new BookingResource.BookingCreateDto();
        req.tripId = java.util.UUID.randomUUID().toString();
        req.seatsRequested = 1;
        BookingDto created = resource.create(req);

        BookingDto confirmed = resource.confirm(created.id);
        assertEquals("CONFIRMED", confirmed.status);

        BookingDto cancelled = resource.cancel(created.id);
        assertEquals("CANCELLED", cancelled.status);

        assertThrows(jakarta.ws.rs.BadRequestException.class, () -> resource.cancel(created.id));
    }

    @Test
    void listMineFiltered_byDateRange() {
        // seed two bookings: now and +1h
        BookingResource.BookingCreateDto req1 = new BookingResource.BookingCreateDto();
        req1.tripId = java.util.UUID.randomUUID().toString();
        req1.seatsRequested = 1;
        resource.create(req1);

        BookingResource.BookingCreateDto req2 = new BookingResource.BookingCreateDto();
        req2.tripId = java.util.UUID.randomUUID().toString();
        req2.seatsRequested = 1;
        resource.create(req2);

        String now = java.time.OffsetDateTime.now().minusMinutes(1).format(java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        String later = java.time.OffsetDateTime.now().plusHours(2).format(java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME);

        java.util.List<BookingDto> list = resource.listMineFiltered(now, later);
        assertTrue(list.size() >= 2);
    }
}


