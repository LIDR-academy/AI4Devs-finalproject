package com.company.covoituraje.trips.service;

import com.company.covoituraje.trips.api.TripCreateDto;
import com.company.covoituraje.trips.domain.Trip;
import com.company.covoituraje.trips.integration.BookingServiceClient;
import com.company.covoituraje.shared.i18n.MessageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripValidationServiceTest {

    @Mock
    private BookingServiceClient bookingServiceClient;
    
    @Mock
    private MessageService messageService;
    
    private TripValidationService validationService;
    
    @BeforeEach
    void setUp() {
        validationService = new TripValidationService(bookingServiceClient, messageService);
    }
    
    @Test
    void validateTripCreation_WithValidData_ShouldReturnEmptyErrors() {
        // Given
        TripCreateDto createDto = createValidTripDto();
        
        // When
        List<String> errors = validationService.validateTripCreation(createDto, "en");
        
        // Then
        assertTrue(errors.isEmpty());
    }
    
    @Test
    void validateTripCreation_WithInvalidLatitude_ShouldReturnError() {
        // Given
        TripCreateDto createDto = createValidTripDto();
        createDto.origin.lat = 95.0; // Invalid latitude
        when(messageService.getMessage(eq("trips.validation.latitude_range"), any())).thenReturn("Latitude must be between -90 and 90");
        
        // When
        List<String> errors = validationService.validateTripCreation(createDto, "en");
        
        // Then
        assertEquals(1, errors.size());
        assertEquals("Latitude must be between -90 and 90", errors.get(0));
    }
    
    @Test
    void validateTripCreation_WithInvalidLongitude_ShouldReturnError() {
        // Given
        TripCreateDto createDto = createValidTripDto();
        createDto.origin.lng = -190.0; // Invalid longitude
        when(messageService.getMessage(eq("trips.validation.longitude_range"), any())).thenReturn("Longitude must be between -180 and 180");
        
        // When
        List<String> errors = validationService.validateTripCreation(createDto, "en");
        
        // Then
        assertEquals(1, errors.size());
        assertEquals("Longitude must be between -180 and 180", errors.get(0));
    }
    
    @Test
    void validateTripCreation_WithNullOrigin_ShouldReturnError() {
        // Given
        TripCreateDto createDto = createValidTripDto();
        createDto.origin = null;
        when(messageService.getMessage(eq("trips.validation.origin_required"), any())).thenReturn("Origin is required");
        
        // When
        List<String> errors = validationService.validateTripCreation(createDto, "en");
        
        // Then
        assertEquals(1, errors.size());
        assertEquals("Origin is required", errors.get(0));
    }
    
    @Test
    void validateTripCreation_WithPastDate_ShouldReturnError() {
        // Given
        TripCreateDto createDto = createValidTripDto();
        createDto.dateTime = OffsetDateTime.now().minusHours(1).toString(); // Past date
        when(messageService.getMessage(eq("trips.validation.datetime_future"), any())).thenReturn("Date must be in the future");
        
        // When
        List<String> errors = validationService.validateTripCreation(createDto, "en");
        
        // Then
        assertEquals(1, errors.size());
        assertEquals("Date must be in the future", errors.get(0));
    }
    
    @Test
    void validateTripCreation_WithInvalidSeats_ShouldReturnError() {
        // Given
        TripCreateDto createDto = createValidTripDto();
        createDto.seatsTotal = 0; // Invalid seats
        when(messageService.getMessage(eq("trips.validation.seats_range"), any())).thenReturn("Seats must be between 1 and 8");
        
        // When
        List<String> errors = validationService.validateTripCreation(createDto, "en");
        
        // Then
        assertEquals(1, errors.size());
        assertEquals("Seats must be between 1 and 8", errors.get(0));
    }
    
    @Test
    void validateTripCreation_WithTooManySeats_ShouldReturnError() {
        // Given
        TripCreateDto createDto = createValidTripDto();
        createDto.seatsTotal = 9; // Too many seats
        when(messageService.getMessage(eq("trips.validation.seats_range"), any())).thenReturn("Seats must be between 1 and 8");
        
        // When
        List<String> errors = validationService.validateTripCreation(createDto, "en");
        
        // Then
        assertEquals(1, errors.size());
        assertEquals("Seats must be between 1 and 8", errors.get(0));
    }
    
    @Test
    void validateTripCreation_WithInvalidDestination_ShouldReturnError() {
        // Given
        TripCreateDto createDto = createValidTripDto();
        createDto.destinationSedeId = "INVALID-SEDE"; // Invalid destination
        when(messageService.getMessage(eq("trips.validation.destination_format"), any())).thenReturn("Destination must be SEDE-1, SEDE-2, or SEDE-3");
        
        // When
        List<String> errors = validationService.validateTripCreation(createDto, "en");
        
        // Then
        assertEquals(1, errors.size());
        assertEquals("Destination must be SEDE-1, SEDE-2, or SEDE-3", errors.get(0));
    }
    
    @Test
    void validateTripCreation_WithEmptyDestination_ShouldReturnError() {
        // Given
        TripCreateDto createDto = createValidTripDto();
        createDto.destinationSedeId = ""; // Empty destination
        when(messageService.getMessage(eq("trips.validation.destination_required"), any())).thenReturn("Destination is required");
        
        // When
        List<String> errors = validationService.validateTripCreation(createDto, "en");
        
        // Then
        assertEquals(1, errors.size());
        assertEquals("Destination is required", errors.get(0));
    }
    
    @Test
    void validateTripUpdate_WithValidData_ShouldReturnEmptyErrors() {
        // Given
        TripCreateDto updateDto = createValidTripDto();
        Trip existingTrip = createValidTrip();
        
        // When
        List<String> errors = validationService.validateTripUpdate(updateDto, existingTrip, "en");
        
        // Then
        assertTrue(errors.isEmpty());
    }
    
    @Test
    void validateTripUpdate_WithSeatsReductionBelowBooked_ShouldReturnError() {
        // Given
        TripCreateDto updateDto = createValidTripDto();
        updateDto.seatsTotal = 2; // Reducing from 4 to 2
        Trip existingTrip = createValidTrip();
        existingTrip.setSeatsTotal(4);
        existingTrip.setSeatsFree(1); // 3 seats are booked
        
        when(messageService.getMessage(eq("trips.validation.cannot_reduce_seats_below_booked"), any()))
                .thenReturn("Cannot reduce seats below currently booked seats");
        
        // When
        List<String> errors = validationService.validateTripUpdate(updateDto, existingTrip, "en");
        
        // Then
        assertEquals(1, errors.size());
        assertEquals("Cannot reduce seats below currently booked seats", errors.get(0));
    }
    
    @Test
    void validateTripDeletion_WithConfirmedBookings_ShouldReturnError() {
        // Given
        Trip trip = createValidTrip();
        when(bookingServiceClient.hasConfirmedBookings(trip.getId().toString())).thenReturn(true);
        when(messageService.getMessage(eq("trips.validation.cannot_delete_with_confirmed_bookings"), any()))
                .thenReturn("Cannot delete trip with confirmed bookings");
        
        // When
        List<String> errors = validationService.validateTripDeletion(trip, "en");
        
        // Then
        assertEquals(1, errors.size());
        assertEquals("Cannot delete trip with confirmed bookings", errors.get(0));
    }
    
    @Test
    void validateTripDeletion_WithoutConfirmedBookings_ShouldReturnEmptyErrors() {
        // Given
        Trip trip = createValidTrip();
        when(bookingServiceClient.hasConfirmedBookings(trip.getId().toString())).thenReturn(false);
        
        // When
        List<String> errors = validationService.validateTripDeletion(trip, "en");
        
        // Then
        assertTrue(errors.isEmpty());
    }
    
    private TripCreateDto createValidTripDto() {
        TripCreateDto dto = new TripCreateDto();
        dto.origin = new TripCreateDto.Origin();
        dto.origin.lat = 41.3851;
        dto.origin.lng = 2.1734;
        dto.destinationSedeId = "SEDE-1";
        dto.dateTime = OffsetDateTime.now().plusHours(1).toString();
        dto.seatsTotal = 4;
        dto.direction = "TO_SEDE";
        return dto;
    }
    
    private Trip createValidTrip() {
        return new Trip(
            "user123",
            "41.3851,2.1734",
            "SEDE-1",
            OffsetDateTime.now().plusHours(1),
            4,
            Trip.Direction.TO_SEDE
        );
    }
}
