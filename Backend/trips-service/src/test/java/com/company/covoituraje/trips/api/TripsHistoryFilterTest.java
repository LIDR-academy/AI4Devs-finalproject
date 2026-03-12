package com.company.covoituraje.trips.api;

import com.company.covoituraje.trips.domain.Trip;
import com.company.covoituraje.trips.infrastructure.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.company.covoituraje.trips.api.TripDto;

class TripsHistoryFilterTest {

    private TripRepository mockRepository;
    private TripsResource resource;

    @BeforeEach
    void setUp() {
        mockRepository = Mockito.mock(TripRepository.class);
        resource = new TripsResource(mockRepository);
        
        // Set up AuthContext
        TripsResource.AuthContext.setUserId("user-001");
    }

    @Test
    void list_ShouldFilterByStatusCompleted() {
        // Arrange: Create trips in the past (completed) and future (active)
        OffsetDateTime pastDate = OffsetDateTime.now().minusDays(5);
        OffsetDateTime futureDate = OffsetDateTime.now().plusDays(5);
        
        Trip completedTrip = new Trip("driver-001", "40.4168,-3.7038", "SEDE-1", pastDate, 4);
        completedTrip.setId(UUID.randomUUID());
        
        Trip activeTrip = new Trip("driver-001", "40.4168,-3.7038", "SEDE-1", futureDate, 4);
        activeTrip.setId(UUID.randomUUID());
        
        when(mockRepository.findAll()).thenReturn(Arrays.asList(completedTrip, activeTrip));
        
        // Act: Call list with status=COMPLETED
        List<TripDto> result = resource.list(null, null, null, "COMPLETED");
        
        // Assert: Only completed trips returned
        assertEquals(1, result.size());
        assertEquals(completedTrip.getId().toString(), result.get(0).id);
    }

    @Test
    void list_ShouldFilterByStatusActive() {
        // Arrange
        OffsetDateTime pastDate = OffsetDateTime.now().minusDays(5);
        OffsetDateTime futureDate = OffsetDateTime.now().plusDays(5);
        
        Trip completedTrip = new Trip("driver-001", "40.4168,-3.7038", "SEDE-1", pastDate, 4);
        completedTrip.setId(UUID.randomUUID());
        
        Trip activeTrip = new Trip("driver-001", "40.4168,-3.7038", "SEDE-1", futureDate, 4);
        activeTrip.setId(UUID.randomUUID());
        
        when(mockRepository.findAll()).thenReturn(Arrays.asList(completedTrip, activeTrip));
        
        // Act
        List<TripDto> result = resource.list(null, null, null, "ACTIVE");
        
        // Assert: Only active trips returned
        assertEquals(1, result.size());
        assertEquals(activeTrip.getId().toString(), result.get(0).id);
    }

    @Test
    void list_ShouldReturnAllTripsWhenNoStatusFilter() {
        // Arrange
        OffsetDateTime pastDate = OffsetDateTime.now().minusDays(5);
        OffsetDateTime futureDate = OffsetDateTime.now().plusDays(5);
        
        Trip completedTrip = new Trip("driver-001", "40.4168,-3.7038", "SEDE-1", pastDate, 4);
        completedTrip.setId(UUID.randomUUID());
        
        Trip activeTrip = new Trip("driver-001", "40.4168,-3.7038", "SEDE-1", futureDate, 4);
        activeTrip.setId(UUID.randomUUID());
        
        when(mockRepository.findAll()).thenReturn(Arrays.asList(completedTrip, activeTrip));
        
        // Act: Call without status filter
        List<TripDto> result = resource.list(null, null, null, null);
        
        // Assert: All trips returned
        assertEquals(2, result.size());
    }

    @Test
    void list_ShouldCombineStatusAndDateFilters() {
        // Arrange
        OffsetDateTime fromDate = OffsetDateTime.now().minusDays(10);
        OffsetDateTime toDate = OffsetDateTime.now().minusDays(1);
        OffsetDateTime pastDate = OffsetDateTime.now().minusDays(5);
        
        Trip completedTrip = new Trip("driver-001", "40.4168,-3.7038", "SEDE-1", pastDate, 4);
        completedTrip.setId(UUID.randomUUID());
        
        when(mockRepository.findByDateTimeBetween(any(), any())).thenReturn(Arrays.asList(completedTrip));
        
        // Act: Call with date range and status
        List<TripDto> result = resource.list(
            null, 
            fromDate.toString(), 
            toDate.toString(), 
            "COMPLETED"
        );
        
        // Assert: Only completed trips in date range
        assertEquals(1, result.size());
        assertEquals(completedTrip.getId().toString(), result.get(0).id);
    }
}

