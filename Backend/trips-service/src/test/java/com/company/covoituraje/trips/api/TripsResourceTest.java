package com.company.covoituraje.trips.api;

import com.company.covoituraje.trips.infrastructure.TripRepository;
import com.company.covoituraje.trips.domain.Trip;
import com.company.covoituraje.trips.service.TripValidationService;
import com.company.covoituraje.trips.integration.BookingServiceClient;
import com.company.covoituraje.shared.i18n.MessageService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ClientErrorException;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import static org.mockito.Mockito.*;

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
    
    @Mock
    private TripValidationService validationService;
    
    @Mock
    private BookingServiceClient bookingServiceClient;
    
    @Mock
    private MessageService messageService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
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
        resource = new TripsResource(repo, messageService, validationService, bookingServiceClient);
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
        TripCreateDto.Origin origin = new TripCreateDto.Origin();
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
        TripCreateDto.Origin origin = new TripCreateDto.Origin();
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
    
    @Test
    void create_withInvalidCoordinates_shouldThrowBadRequest() {
        // Given
        TripCreateDto create = new TripCreateDto();
        TripCreateDto.Origin origin = new TripCreateDto.Origin();
        origin.lat = 95.0; // Invalid latitude
        origin.lng = -3.7038;
        create.origin = origin;
        create.destinationSedeId = "SEDE-1";
        create.dateTime = "2025-10-06T08:30:00+00:00";
        create.seatsTotal = 3;
        
        when(validationService.validateTripCreation(any(), any())).thenReturn(List.of("Latitude must be between -90 and 90"));
        
        // When & Then
        BadRequestException exception = assertThrows(BadRequestException.class, 
            () -> resource.create(create, "en"));
        assertEquals("Latitude must be between -90 and 90", exception.getMessage());
    }
    
    @Test
    void create_withPastDate_shouldThrowBadRequest() {
        // Given
        TripCreateDto create = new TripCreateDto();
        TripCreateDto.Origin origin = new TripCreateDto.Origin();
        origin.lat = 40.4168;
        origin.lng = -3.7038;
        create.origin = origin;
        create.destinationSedeId = "SEDE-1";
        create.dateTime = "2020-10-06T08:30:00+00:00"; // Past date
        create.seatsTotal = 3;
        
        when(validationService.validateTripCreation(any(), any())).thenReturn(List.of("Date must be in the future"));
        
        // When & Then
        BadRequestException exception = assertThrows(BadRequestException.class, 
            () -> resource.create(create, "en"));
        assertEquals("Date must be in the future", exception.getMessage());
    }
    
    @Test
    void update_withInvalidSeats_shouldThrowBadRequest() {
        // Given: Create a valid trip first
        TripCreateDto create = new TripCreateDto();
        TripCreateDto.Origin origin = new TripCreateDto.Origin();
        origin.lat = 40.4168;
        origin.lng = -3.7038;
        create.origin = origin;
        create.destinationSedeId = "SEDE-1";
        create.dateTime = "2025-10-06T08:30:00+00:00";
        create.seatsTotal = 4;
        
        when(validationService.validateTripCreation(any(), any())).thenReturn(List.of());
        TripDto createdTrip = resource.create(create, "en");
        
        // When: Try to update with invalid seats
        TripCreateDto update = new TripCreateDto();
        update.seatsTotal = 0; // Invalid seats
        
        when(validationService.validateTripUpdate(any(), any(), any())).thenReturn(List.of("Seats must be between 1 and 8"));
        
        // Then
        BadRequestException exception = assertThrows(BadRequestException.class, 
            () -> resource.update(createdTrip.id, update, "en"));
        assertEquals("Seats must be between 1 and 8", exception.getMessage());
    }
    
    @Test
    void update_withSeatsReductionBelowBooked_shouldThrowBadRequest() {
        // Given: Create a trip and simulate some bookings
        TripCreateDto create = new TripCreateDto();
        TripCreateDto.Origin origin = new TripCreateDto.Origin();
        origin.lat = 40.4168;
        origin.lng = -3.7038;
        create.origin = origin;
        create.destinationSedeId = "SEDE-1";
        create.dateTime = "2025-10-06T08:30:00+00:00";
        create.seatsTotal = 4;
        
        when(validationService.validateTripCreation(any(), any())).thenReturn(List.of());
        TripDto createdTrip = resource.create(create, "en");
        
        // Simulate 2 seats being booked
        Trip trip = em.find(Trip.class, UUID.fromString(createdTrip.id));
        trip.reserveSeats(2);
        em.getTransaction().begin();
        em.merge(trip);
        em.getTransaction().commit();
        
        // When: Try to reduce seats below booked amount
        TripCreateDto update = new TripCreateDto();
        update.seatsTotal = 1; // Less than 2 booked seats
        
        when(validationService.validateTripUpdate(any(), any(), any()))
            .thenReturn(List.of("Cannot reduce seats below currently booked seats"));
        
        // Then
        BadRequestException exception = assertThrows(BadRequestException.class, 
            () -> resource.update(createdTrip.id, update, "en"));
        assertEquals("Cannot reduce seats below currently booked seats", exception.getMessage());
    }
    
    @Test
    void delete_withConfirmedBookings_shouldThrowConflict() {
        // Given: Create a trip
        TripCreateDto create = new TripCreateDto();
        TripCreateDto.Origin origin = new TripCreateDto.Origin();
        origin.lat = 40.4168;
        origin.lng = -3.7038;
        create.origin = origin;
        create.destinationSedeId = "SEDE-1";
        create.dateTime = "2025-10-06T08:30:00+00:00";
        create.seatsTotal = 4;
        
        when(validationService.validateTripCreation(any(), any())).thenReturn(List.of());
        TripDto createdTrip = resource.create(create, "en");
        
        // When: Try to delete with confirmed bookings
        when(validationService.validateTripDeletion(any(), any()))
            .thenReturn(List.of("Cannot delete trip with confirmed bookings"));
        
        // Then
        ClientErrorException exception = assertThrows(ClientErrorException.class, 
            () -> resource.delete(createdTrip.id, "en"));
        assertEquals("Cannot delete trip with confirmed bookings", exception.getMessage());
        assertEquals(Response.Status.CONFLICT.getStatusCode(), exception.getResponse().getStatus());
    }
    
    @Test
    void create_withValidData_shouldPassValidation() {
        // Given
        TripCreateDto create = new TripCreateDto();
        TripCreateDto.Origin origin = new TripCreateDto.Origin();
        origin.lat = 40.4168;
        origin.lng = -3.7038;
        create.origin = origin;
        create.destinationSedeId = "SEDE-1";
        create.dateTime = "2025-10-06T08:30:00+00:00";
        create.seatsTotal = 3;
        
        when(validationService.validateTripCreation(any(), any())).thenReturn(List.of());
        
        // When
        TripDto result = resource.create(create, "en");
        
        // Then
        assertNotNull(result);
        assertEquals("SEDE-1", result.destinationSedeId);
        assertEquals(3, result.seatsTotal);
        verify(validationService).validateTripCreation(create, "en");
    }
    
    @Test
    void update_withValidData_shouldPassValidation() {
        // Given: Create a trip first
        TripCreateDto create = new TripCreateDto();
        TripCreateDto.Origin origin = new TripCreateDto.Origin();
        origin.lat = 40.4168;
        origin.lng = -3.7038;
        create.origin = origin;
        create.destinationSedeId = "SEDE-1";
        create.dateTime = "2025-10-06T08:30:00+00:00";
        create.seatsTotal = 4;
        
        when(validationService.validateTripCreation(any(), any())).thenReturn(List.of());
        TripDto createdTrip = resource.create(create, "en");
        
        // When: Update with valid data
        TripCreateDto update = new TripCreateDto();
        update.seatsTotal = 5;
        
        when(validationService.validateTripUpdate(any(), any(), any())).thenReturn(List.of());
        
        TripDto result = resource.update(createdTrip.id, update, "en");
        
        // Then
        assertNotNull(result);
        assertEquals(5, result.seatsTotal);
        verify(validationService).validateTripUpdate(eq(update), any(Trip.class), eq("en"));
    }
}
