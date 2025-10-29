package com.company.covoituraje.booking.api;

import com.company.covoituraje.booking.domain.Booking;
import com.company.covoituraje.booking.infrastructure.BookingRepository;
import com.company.covoituraje.booking.service.BookingValidationService;
import com.company.covoituraje.booking.integration.NotificationServiceClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BookingHistoryFilterTest {

    private BookingRepository mockRepository;
    private BookingValidationService mockValidationService;
    private NotificationServiceClient mockNotificationClient;
    private BookingResource resource;

    @BeforeEach
    void setUp() {
        mockRepository = Mockito.mock(BookingRepository.class);
        mockValidationService = Mockito.mock(BookingValidationService.class);
        mockNotificationClient = Mockito.mock(NotificationServiceClient.class);
        resource = new BookingResource(mockRepository, mockValidationService, mockNotificationClient);
        
        // Set up AuthContext
        BookingResource.AuthContext.setUserId("user-001");
    }

    @Test
    void listMine_ShouldFilterByStatusConfirmed() {
        // Arrange: Create bookings with different statuses
        UUID tripId1 = UUID.randomUUID();
        UUID tripId2 = UUID.randomUUID();
        
        Booking confirmedBooking = new Booking(tripId1, "user-001", 2, "CONFIRMED");
        confirmedBooking.setId(UUID.randomUUID());
        
        Booking pendingBooking = new Booking(tripId2, "user-001", 1, "PENDING");
        pendingBooking.setId(UUID.randomUUID());
        
        when(mockRepository.findByPassengerId("user-001")).thenReturn(Arrays.asList(confirmedBooking, pendingBooking));
        
        // Act: Call listMine with status=CONFIRMED
        List<BookingDto> result = resource.listMine(null, null, "CONFIRMED");
        
        // Assert: Only confirmed bookings returned
        assertEquals(1, result.size());
        assertEquals(confirmedBooking.getId().toString(), result.get(0).id);
        assertEquals("CONFIRMED", result.get(0).status);
    }

    @Test
    void listMine_ShouldFilterByStatusPending() {
        // Arrange
        UUID tripId1 = UUID.randomUUID();
        UUID tripId2 = UUID.randomUUID();
        
        Booking confirmedBooking = new Booking(tripId1, "user-001", 2, "CONFIRMED");
        confirmedBooking.setId(UUID.randomUUID());
        
        Booking pendingBooking = new Booking(tripId2, "user-001", 1, "PENDING");
        pendingBooking.setId(UUID.randomUUID());
        
        when(mockRepository.findByPassengerId("user-001")).thenReturn(Arrays.asList(confirmedBooking, pendingBooking));
        
        // Act
        List<BookingDto> result = resource.listMine(null, null, "PENDING");
        
        // Assert: Only pending bookings returned
        assertEquals(1, result.size());
        assertEquals(pendingBooking.getId().toString(), result.get(0).id);
        assertEquals("PENDING", result.get(0).status);
    }

    @Test
    void listMine_ShouldReturnAllBookingsWhenNoStatusFilter() {
        // Arrange
        UUID tripId1 = UUID.randomUUID();
        UUID tripId2 = UUID.randomUUID();
        
        Booking confirmedBooking = new Booking(tripId1, "user-001", 2, "CONFIRMED");
        confirmedBooking.setId(UUID.randomUUID());
        
        Booking pendingBooking = new Booking(tripId2, "user-001", 1, "PENDING");
        pendingBooking.setId(UUID.randomUUID());
        
        when(mockRepository.findByPassengerId("user-001")).thenReturn(Arrays.asList(confirmedBooking, pendingBooking));
        
        // Act: Call without status filter
        List<BookingDto> result = resource.listMine(null, null, null);
        
        // Assert: All bookings returned
        assertEquals(2, result.size());
    }

    @Test
    void listMine_ShouldCombineStatusAndDateFilters() {
        // Arrange
        OffsetDateTime fromDate = OffsetDateTime.now().minusDays(10);
        OffsetDateTime toDate = OffsetDateTime.now().minusDays(1);
        OffsetDateTime pastDate = OffsetDateTime.now().minusDays(5);
        
        UUID tripId = UUID.randomUUID();
        Booking confirmedBooking = new Booking(tripId, "user-001", 2, "CONFIRMED");
        confirmedBooking.setId(UUID.randomUUID());
        confirmedBooking.setCreatedAt(pastDate);
        
        when(mockRepository.findByPassengerIdAndCreatedAtBetween("user-001", fromDate, toDate))
            .thenReturn(Arrays.asList(confirmedBooking));
        
        // Act: Call with date range and status
        List<BookingDto> result = resource.listMine(
            fromDate.toString(), 
            toDate.toString(), 
            "CONFIRMED"
        );
        
        // Assert: Only confirmed bookings in date range
        assertEquals(1, result.size());
        assertEquals(confirmedBooking.getId().toString(), result.get(0).id);
        assertEquals("CONFIRMED", result.get(0).status);
    }

    @Test
    void listMine_ShouldFilterByStatusCancelled() {
        // Arrange
        UUID tripId1 = UUID.randomUUID();
        UUID tripId2 = UUID.randomUUID();
        
        Booking cancelledBooking = new Booking(tripId1, "user-001", 2, "CANCELLED");
        cancelledBooking.setId(UUID.randomUUID());
        
        Booking confirmedBooking = new Booking(tripId2, "user-001", 1, "CONFIRMED");
        confirmedBooking.setId(UUID.randomUUID());
        
        when(mockRepository.findByPassengerId("user-001")).thenReturn(Arrays.asList(cancelledBooking, confirmedBooking));
        
        // Act
        List<BookingDto> result = resource.listMine(null, null, "CANCELLED");
        
        // Assert: Only cancelled bookings returned
        assertEquals(1, result.size());
        assertEquals(cancelledBooking.getId().toString(), result.get(0).id);
        assertEquals("CANCELLED", result.get(0).status);
    }
}
