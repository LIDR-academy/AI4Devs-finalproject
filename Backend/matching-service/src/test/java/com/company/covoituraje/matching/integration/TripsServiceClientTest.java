package com.company.covoituraje.matching.integration;

import com.company.covoituraje.http.ServiceHttpClient;
import com.company.covoituraje.http.ServiceIntegrationException;
import com.company.covoituraje.shared.dto.TripDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Test para verificar la integración con trips-service
 */
@ExtendWith(MockitoExtension.class)
class TripsServiceClientTest {
    
    @Mock
    private ServiceHttpClient httpClient;
    
    @Test
    void getAvailableTrips_ShouldReturnTripsFromService() throws ServiceIntegrationException {
        // Arrange
        TripsServiceClient client = new TripsServiceClient(httpClient);
        String destinationSedeId = "SEDE-1";
        
        TripDto[] mockTrips = {
            createMockTripDto("trip1", "user1", "SEDE-1", 2),
            createMockTripDto("trip2", "user2", "SEDE-1", 1)
        };
        
        when(httpClient.get(anyString(), any(Class.class))).thenReturn(mockTrips);
        
        // Act
        List<TripDto> result = client.getAvailableTrips(destinationSedeId);
        
        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("trip1", result.get(0).id);
        assertEquals("trip2", result.get(1).id);
    }
    
    @Test
    void getTripById_ShouldReturnSpecificTrip() throws ServiceIntegrationException {
        // Arrange
        TripsServiceClient client = new TripsServiceClient(httpClient);
        String tripId = "trip1";
        
        TripDto mockTrip = createMockTripDto(tripId, "user1", "SEDE-1", 2);
        
        when(httpClient.get(anyString(), any(Class.class))).thenReturn(mockTrip);
        
        // Act
        TripDto result = client.getTripById(tripId);
        
        // Assert
        assertNotNull(result);
        assertEquals(tripId, result.id);
        assertEquals("user1", result.driverId);
        assertEquals("SEDE-1", result.destinationSedeId);
    }
    
    @Test
    void getAvailableTrips_ShouldHandleServiceException() throws ServiceIntegrationException {
        // Arrange
        TripsServiceClient client = new TripsServiceClient(httpClient);
        String destinationSedeId = "SEDE-1";
        
        when(httpClient.get(anyString(), any(Class.class)))
            .thenThrow(new ServiceIntegrationException("Service unavailable"));
        
        // Act & Assert
        ServiceIntegrationException exception = assertThrows(
            ServiceIntegrationException.class,
            () -> client.getAvailableTrips(destinationSedeId)
        );
        
        assertTrue(exception.getMessage().contains("Error fetching available trips for destination"));
        assertTrue(exception.getMessage().contains("SEDE-1"));
        assertTrue(exception.getCause().getMessage().contains("Service unavailable"));
    }
    
    private TripDto createMockTripDto(String id, String driverId, String destinationSedeId, int seatsFree) {
        TripDto trip = new TripDto();
        trip.id = id;
        trip.driverId = driverId;
        trip.destinationSedeId = destinationSedeId;
        trip.seatsFree = seatsFree;
        trip.seatsTotal = seatsFree + 1;
        trip.dateTime = "2025-01-15T08:30:00Z";
        
        TripDto.Origin origin = new TripDto.Origin();
        origin.lat = 40.4168;
        origin.lng = -3.7038;
        trip.origin = origin;
        
        return trip;
    }
}
