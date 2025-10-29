package com.company.covoituraje.trips.api;

import com.company.covoituraje.trips.domain.Trip;
import com.company.covoituraje.trips.infrastructure.TripRepository;
import com.company.covoituraje.shared.i18n.MessageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TripsResourceDirectionTest {

    @Mock
    private TripRepository repository;

    @Mock
    private MessageService messageService;

    private TripsResource tripsResource;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        tripsResource = new TripsResource(repository, messageService);
    }

    @Test
    void shouldCreateTripWithToSedeDirection() {
        // Given
        TripCreateDto createDto = new TripCreateDto();
        createDto.destinationSedeId = "SEDE-1";
        createDto.dateTime = OffsetDateTime.now().plusDays(2).withHour(8).withMinute(0).withSecond(0).withNano(0).toString();
        createDto.seatsTotal = 4;
        createDto.direction = "TO_SEDE";
        
        TripCreateDto.Origin origin = new TripCreateDto.Origin();
        origin.lat = 40.4168;
        origin.lng = -3.7038;
        createDto.origin = origin;

        Trip savedTrip = new Trip("driver-123", "40.4168,-3.7038", "SEDE-1", 
                                 OffsetDateTime.parse(createDto.dateTime), 4, Trip.Direction.TO_SEDE);
        when(repository.save(any(Trip.class))).thenReturn(savedTrip);

        // Set up auth context
        TripsResource.AuthContext.setUserId("driver-123");

        // When
        TripDto result = tripsResource.create(createDto, "en");

        // Then
        assertNotNull(result);
        assertEquals("TO_SEDE", result.direction);
        verify(repository).save(any(Trip.class));
    }

    @Test
    void shouldCreateTripWithFromSedeDirection() {
        // Given
        TripCreateDto createDto = new TripCreateDto();
        createDto.destinationSedeId = "SEDE-1";
        createDto.dateTime = OffsetDateTime.now().plusDays(2).withHour(17).withMinute(0).withSecond(0).withNano(0).toString();
        createDto.seatsTotal = 3;
        createDto.direction = "FROM_SEDE";
        
        TripCreateDto.Origin origin = new TripCreateDto.Origin();
        origin.lat = 40.4168;
        origin.lng = -3.7038;
        createDto.origin = origin;

        Trip savedTrip = new Trip("driver-123", "40.4168,-3.7038", "SEDE-1", 
                                 OffsetDateTime.parse(createDto.dateTime), 3, Trip.Direction.FROM_SEDE);
        when(repository.save(any(Trip.class))).thenReturn(savedTrip);

        // Set up auth context
        TripsResource.AuthContext.setUserId("driver-123");

        // When
        TripDto result = tripsResource.create(createDto, "en");

        // Then
        assertNotNull(result);
        assertEquals("FROM_SEDE", result.direction);
        verify(repository).save(any(Trip.class));
    }

    @Test
    void shouldUpdateTripWithDirection() {
        // Given
        String tripId = UUID.randomUUID().toString();
        TripCreateDto updateDto = new TripCreateDto();
        updateDto.direction = "FROM_SEDE";
        updateDto.destinationSedeId = "SEDE-2";
        updateDto.dateTime = OffsetDateTime.now().plusDays(2).withHour(18).withMinute(0).withSecond(0).withNano(0).toString();
        updateDto.seatsTotal = 2;
        
        TripCreateDto.Origin origin = new TripCreateDto.Origin();
        origin.lat = 41.3851;
        origin.lng = 2.1734;
        updateDto.origin = origin;

        Trip existingTrip = new Trip("driver-123", "40.4168,-3.7038", "SEDE-1", 
                                    OffsetDateTime.now().plusDays(2).withHour(8).withMinute(0).withSecond(0).withNano(0), 4, Trip.Direction.TO_SEDE);
        existingTrip.setId(UUID.fromString(tripId));
        
        when(repository.findById(UUID.fromString(tripId))).thenReturn(Optional.of(existingTrip));
        when(repository.save(any(Trip.class))).thenReturn(existingTrip);

        // Set up auth context
        TripsResource.AuthContext.setUserId("driver-123");

        // When
        TripDto result = tripsResource.update(tripId, updateDto, "en");

        // Then
        assertNotNull(result);
        assertEquals("FROM_SEDE", result.direction);
        verify(repository).save(any(Trip.class));
    }

    @Test
    void shouldReturnTripWithDirectionAndPairedTripId() {
        // Given
        String tripId = UUID.randomUUID().toString();
        UUID pairedTripId = UUID.randomUUID();
        
        Trip trip = new Trip("driver-123", "40.4168,-3.7038", "SEDE-1", 
                           OffsetDateTime.now().plusDays(2).withHour(8).withMinute(0).withSecond(0).withNano(0), 4, Trip.Direction.TO_SEDE, pairedTripId);
        trip.setId(UUID.fromString(tripId));
        
        when(repository.findById(UUID.fromString(tripId))).thenReturn(Optional.of(trip));

        // When
        TripDto result = tripsResource.getById(tripId, "en");

        // Then
        assertNotNull(result);
        assertEquals("TO_SEDE", result.direction);
        assertEquals(pairedTripId.toString(), result.pairedTripId);
    }
}
