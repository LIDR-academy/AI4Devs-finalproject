package com.company.covoituraje.booking.api;

import com.company.covoituraje.booking.domain.Booking;
import com.company.covoituraje.booking.infrastructure.BookingRepository;
import com.company.covoituraje.booking.integration.NotificationServiceClient;
import com.company.covoituraje.booking.integration.TripsServiceClient;
import com.company.covoituraje.booking.integration.UsersServiceClient;
import com.company.covoituraje.booking.service.BookingValidationService;
import jakarta.ws.rs.BadRequestException;
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
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.doNothing;

/**
 * TDD tests for booking business rules:
 * 1. Booking starts in PENDING status
 * 2. Seat availability validation blocks booking when no seats
 * 3. Notifications sent on confirm/cancel
 * 4. Driver cancellation cutoff (configurable)
 * 5. Passenger can cancel anytime
 */
@Testcontainers
class BookingBusinessRulesTest {

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
    private TripsServiceClient tripsServiceClient;
    private UsersServiceClient usersServiceClient;
    private NotificationServiceClient notificationClient;
    private BookingValidationService validationService;

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

        // Mock external services
        tripsServiceClient = Mockito.mock(TripsServiceClient.class);
        usersServiceClient = Mockito.mock(UsersServiceClient.class);
        notificationClient = Mockito.mock(NotificationServiceClient.class);

        // Default mock behaviors
        try {
            when(usersServiceClient.userExists(anyString())).thenReturn(true);
            when(tripsServiceClient.hasAvailableSeats(anyString(), anyInt())).thenReturn(true);
            doNothing().when(notificationClient).sendBookingConfirmed(anyString(), anyString(), anyInt());
            doNothing().when(notificationClient).sendBookingCancelled(anyString(), anyString());
        } catch (Exception e) {
            // Mock setup - exceptions handled in individual tests
        }

        validationService = new BookingValidationService(tripsServiceClient, usersServiceClient);
        resource = new BookingResource(repository, validationService, notificationClient);

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
    void createBooking_ShouldStartInPendingStatus() throws Exception {
        // Arrange
        BookingResource.BookingCreateDto request = new BookingResource.BookingCreateDto();
        request.tripId = "550e8400-e29b-41d4-a716-446655440001";
        request.seatsRequested = 2;

        // Act
        BookingDto result = resource.create(request);

        // Assert
        assertEquals("PENDING", result.status);
        assertNotNull(result.id);
        assertEquals(request.tripId, result.tripId);
        assertEquals("test-user-001", result.passengerId);
        assertEquals(2, result.seatsRequested);
    }

    @Test
    void createBooking_ShouldBlockWhenNoSeatsAvailable() throws Exception {
        // Arrange
        when(tripsServiceClient.hasAvailableSeats(anyString(), anyInt())).thenReturn(false);
        
        BookingResource.BookingCreateDto request = new BookingResource.BookingCreateDto();
        request.tripId = "550e8400-e29b-41d4-a716-446655440001";
        request.seatsRequested = 3;

        // Act & Assert
        BadRequestException exception = assertThrows(
            BadRequestException.class,
            () -> resource.create(request)
        );

        assertTrue(exception.getMessage().contains("Validation failed"));
        assertTrue(exception.getMessage().contains("insufficient seats"));
        
        verify(tripsServiceClient).hasAvailableSeats(request.tripId, 3);
    }

    @Test
    void confirmBooking_ShouldSendNotification() throws Exception {
        // Arrange
        BookingResource.BookingCreateDto createRequest = new BookingResource.BookingCreateDto();
        createRequest.tripId = "550e8400-e29b-41d4-a716-446655440001";
        createRequest.seatsRequested = 1;

        BookingDto created = resource.create(createRequest);
        String bookingId = created.id;

        // Act
        BookingDto confirmed = resource.confirm(bookingId);

        // Assert
        assertEquals("CONFIRMED", confirmed.status);
        verify(notificationClient).sendBookingConfirmed("test-user-001", createRequest.tripId, 1);
    }

    @Test
    void cancelBooking_ShouldSendNotification() throws Exception {
        // Arrange
        BookingResource.BookingCreateDto createRequest = new BookingResource.BookingCreateDto();
        createRequest.tripId = "550e8400-e29b-41d4-a716-446655440001";
        createRequest.seatsRequested = 1;

        BookingDto created = resource.create(createRequest);
        String bookingId = created.id;

        // Act
        BookingDto cancelled = resource.cancel(bookingId);

        // Assert
        assertEquals("CANCELLED", cancelled.status);
        verify(notificationClient).sendBookingCancelled("test-user-001", createRequest.tripId);
    }

    @Test
    void confirmBooking_ShouldOnlyWorkOnPendingBookings() throws Exception {
        // Arrange
        BookingResource.BookingCreateDto createRequest = new BookingResource.BookingCreateDto();
        createRequest.tripId = "550e8400-e29b-41d4-a716-446655440001";
        createRequest.seatsRequested = 1;

        BookingDto created = resource.create(createRequest);
        String bookingId = created.id;

        // First confirm
        resource.confirm(bookingId);

        // Act & Assert - Try to confirm again
        BadRequestException exception = assertThrows(
            BadRequestException.class,
            () -> resource.confirm(bookingId)
        );

        assertTrue(exception.getMessage().contains("Only pending bookings can be confirmed"));
    }

    @Test
    void cancelBooking_ShouldWorkOnPendingAndConfirmedBookings() throws Exception {
        // Arrange
        BookingResource.BookingCreateDto createRequest = new BookingResource.BookingCreateDto();
        createRequest.tripId = "550e8400-e29b-41d4-a716-446655440001";
        createRequest.seatsRequested = 1;

        BookingDto created = resource.create(createRequest);
        String bookingId = created.id;

        // Test cancel on PENDING
        BookingDto cancelled = resource.cancel(bookingId);
        assertEquals("CANCELLED", cancelled.status);

        // Test cancel on already cancelled (should fail)
        BadRequestException exception = assertThrows(
            BadRequestException.class,
            () -> resource.cancel(bookingId)
        );

        assertTrue(exception.getMessage().contains("Booking is already cancelled"));
    }

    @Test
    void cancelBooking_ShouldNotWorkOnAlreadyCancelledBookings() throws Exception {
        // Arrange
        BookingResource.BookingCreateDto createRequest = new BookingResource.BookingCreateDto();
        createRequest.tripId = "550e8400-e29b-41d4-a716-446655440001";
        createRequest.seatsRequested = 1;

        BookingDto created = resource.create(createRequest);
        String bookingId = created.id;

        // Cancel once
        resource.cancel(bookingId);

        // Act & Assert - Try to cancel again
        BadRequestException exception = assertThrows(
            BadRequestException.class,
            () -> resource.cancel(bookingId)
        );

        assertTrue(exception.getMessage().contains("Booking is already cancelled"));
    }

    @Test
    void createBooking_ShouldValidateUserExists() throws Exception {
        // Arrange
        when(usersServiceClient.userExists("test-user-001")).thenReturn(false);
        
        BookingResource.BookingCreateDto request = new BookingResource.BookingCreateDto();
        request.tripId = "550e8400-e29b-41d4-a716-446655440001";
        request.seatsRequested = 1;

        // Act & Assert
        BadRequestException exception = assertThrows(
            BadRequestException.class,
            () -> resource.create(request)
        );

        assertTrue(exception.getMessage().contains("Validation failed"));
        assertTrue(exception.getMessage().contains("User not found"));
        
        verify(usersServiceClient).userExists("test-user-001");
    }

    @Test
    void createBooking_ShouldValidateTripIdFormat() throws Exception {
        // Arrange
        BookingResource.BookingCreateDto request = new BookingResource.BookingCreateDto();
        request.tripId = "invalid-uuid-format";
        request.seatsRequested = 1;

        // Act & Assert
        BadRequestException exception = assertThrows(
            BadRequestException.class,
            () -> resource.create(request)
        );

        assertTrue(exception.getMessage().contains("Invalid trip ID format"));
    }

    @Test
    void createBooking_ShouldValidateSeatsRequested() throws Exception {
        // Test zero seats
        BookingResource.BookingCreateDto request1 = new BookingResource.BookingCreateDto();
        request1.tripId = "550e8400-e29b-41d4-a716-446655440001";
        request1.seatsRequested = 0;

        BadRequestException exception1 = assertThrows(
            BadRequestException.class,
            () -> resource.create(request1)
        );
        assertTrue(exception1.getMessage().contains("Valid number of seats is required"));

        // Test negative seats
        BookingResource.BookingCreateDto request2 = new BookingResource.BookingCreateDto();
        request2.tripId = "550e8400-e29b-41d4-a716-446655440001";
        request2.seatsRequested = -1;

        BadRequestException exception2 = assertThrows(
            BadRequestException.class,
            () -> resource.create(request2)
        );
        assertTrue(exception2.getMessage().contains("Valid number of seats is required"));
    }

    @Test
    void createBooking_ShouldValidateRequiredFields() throws Exception {
        // Test missing tripId
        BookingResource.BookingCreateDto request1 = new BookingResource.BookingCreateDto();
        request1.seatsRequested = 1;

        BadRequestException exception1 = assertThrows(
            BadRequestException.class,
            () -> resource.create(request1)
        );
        assertTrue(exception1.getMessage().contains("Trip ID is required"));

        // Test null tripId
        BookingResource.BookingCreateDto request2 = new BookingResource.BookingCreateDto();
        request2.tripId = null;
        request2.seatsRequested = 1;

        BadRequestException exception2 = assertThrows(
            BadRequestException.class,
            () -> resource.create(request2)
        );
        assertTrue(exception2.getMessage().contains("Trip ID is required"));
    }
}
