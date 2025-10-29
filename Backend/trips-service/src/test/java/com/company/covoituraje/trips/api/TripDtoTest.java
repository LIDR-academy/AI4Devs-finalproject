package com.company.covoituraje.trips.api;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TripDtoTest {

    @Test
    void shouldCreateTripDtoWithDirection() {
        // Given
        TripDto tripDto = new TripDto();
        tripDto.id = "trip-123";
        tripDto.driverId = "driver-456";
        tripDto.destinationSedeId = "SEDE-1";
        tripDto.dateTime = "2024-01-15T08:00:00Z";
        tripDto.seatsTotal = 4;
        tripDto.seatsFree = 3;
        tripDto.direction = "TO_SEDE";
        tripDto.pairedTripId = "trip-456";
        
        TripDto.Origin origin = new TripDto.Origin();
        origin.lat = 40.4168;
        origin.lng = -3.7038;
        tripDto.origin = origin;

        // When & Then
        assertEquals("trip-123", tripDto.id);
        assertEquals("driver-456", tripDto.driverId);
        assertEquals("SEDE-1", tripDto.destinationSedeId);
        assertEquals("2024-01-15T08:00:00Z", tripDto.dateTime);
        assertEquals(4, tripDto.seatsTotal);
        assertEquals(3, tripDto.seatsFree);
        assertEquals("TO_SEDE", tripDto.direction);
        assertEquals("trip-456", tripDto.pairedTripId);
        assertNotNull(tripDto.origin);
        assertEquals(40.4168, tripDto.origin.lat);
        assertEquals(-3.7038, tripDto.origin.lng);
    }

    @Test
    void shouldCreateTripDtoWithFromSedeDirection() {
        // Given
        TripDto tripDto = new TripDto();
        tripDto.direction = "FROM_SEDE";
        tripDto.pairedTripId = null; // Optional field

        // When & Then
        assertEquals("FROM_SEDE", tripDto.direction);
        assertNull(tripDto.pairedTripId);
    }

    @Test
    void shouldCreateOriginWithCoordinates() {
        // Given
        TripDto.Origin origin = new TripDto.Origin();
        origin.lat = 41.3851;
        origin.lng = 2.1734;

        // When & Then
        assertEquals(41.3851, origin.lat);
        assertEquals(2.1734, origin.lng);
    }
}
