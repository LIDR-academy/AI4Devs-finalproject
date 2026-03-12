package com.company.covoituraje.booking.integration;

import com.company.covoituraje.booking.domain.Booking;
import com.company.covoituraje.booking.infrastructure.BookingRepository;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
class BookingRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("init-schema.sql")
            .withStartupTimeout(Duration.ofMinutes(2));

    private EntityManagerFactory emf;
    private EntityManager em;
    private BookingRepository repository;

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
        
        emf = Persistence.createEntityManagerFactory("bookings-pu", props);
        em = emf.createEntityManager();
        repository = new BookingRepository(em);
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
    void shouldSaveAndFindBooking() {
        // Given
        UUID tripId = UUID.randomUUID();
        Booking booking = new Booking(tripId, "passenger-123", 2, "PENDING");

        // When
        Booking savedBooking = repository.save(booking);
        
        // Then
        assertNotNull(savedBooking.getId());
        assertEquals(tripId, savedBooking.getTripId());
        assertEquals("passenger-123", savedBooking.getPassengerId());
        assertEquals(2, savedBooking.getSeatsRequested());
        assertEquals("PENDING", savedBooking.getStatus());
    }

    @Test
    void shouldFindBookingsByPassenger() {
        // Given
        UUID tripId1 = UUID.randomUUID();
        UUID tripId2 = UUID.randomUUID();
        Booking booking1 = new Booking(tripId1, "passenger-123", 1, "PENDING");
        Booking booking2 = new Booking(tripId2, "passenger-456", 2, "CONFIRMED");
        Booking booking3 = new Booking(tripId1, "passenger-123", 1, "CONFIRMED");
        
        repository.save(booking1);
        repository.save(booking2);
        repository.save(booking3);

        // When
        List<Booking> passengerBookings = repository.findByPassengerId("passenger-123");

        // Then
        assertEquals(2, passengerBookings.size());
        assertTrue(passengerBookings.stream().allMatch(b -> "passenger-123".equals(b.getPassengerId())));
    }

    @Test
    void shouldFindBookingsByTrip() {
        // Given
        UUID tripId = UUID.randomUUID();
        Booking booking1 = new Booking(tripId, "passenger-1", 1, "PENDING");
        Booking booking2 = new Booking(tripId, "passenger-2", 2, "CONFIRMED");
        Booking booking3 = new Booking(UUID.randomUUID(), "passenger-3", 1, "PENDING");
        
        repository.save(booking1);
        repository.save(booking2);
        repository.save(booking3);

        // When
        List<Booking> tripBookings = repository.findByTripId(tripId);

        // Then
        assertEquals(2, tripBookings.size());
        assertTrue(tripBookings.stream().allMatch(b -> tripId.equals(b.getTripId())));
    }

    @Test
    void shouldFindBookingsByStatus() {
        // Given
        Booking booking1 = new Booking(UUID.randomUUID(), "passenger-1", 1, "PENDING");
        Booking booking2 = new Booking(UUID.randomUUID(), "passenger-2", 2, "CONFIRMED");
        Booking booking3 = new Booking(UUID.randomUUID(), "passenger-3", 1, "PENDING");
        
        repository.save(booking1);
        repository.save(booking2);
        repository.save(booking3);

        // When
        List<Booking> pendingBookings = repository.findByStatus("PENDING");

        // Then
        assertEquals(2, pendingBookings.size());
        assertTrue(pendingBookings.stream().allMatch(b -> "PENDING".equals(b.getStatus())));
    }

    @Test
    void shouldUpdateBookingStatus() {
        // Given
        Booking booking = new Booking(UUID.randomUUID(), "passenger-123", 2, "PENDING");
        booking = repository.save(booking);

        // When
        booking.confirm();
        Booking updatedBooking = repository.save(booking);

        // Then
        assertEquals("CONFIRMED", updatedBooking.getStatus());
        assertTrue(updatedBooking.isConfirmed());
    }

    @Test
    void shouldFindBookingById() {
        // Given
        Booking booking = new Booking(UUID.randomUUID(), "passenger-123", 2, "PENDING");
        booking = repository.save(booking);

        // When
        Optional<Booking> foundBooking = repository.findById(booking.getId());

        // Then
        assertTrue(foundBooking.isPresent());
        assertEquals(booking.getId(), foundBooking.get().getId());
        assertEquals("passenger-123", foundBooking.get().getPassengerId());
    }
}
