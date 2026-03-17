package com.company.covoituraje.trips.api;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TripCreateDtoTest {

    @Test
    void shouldCreateTripCreateDtoWithDirection() {
        // Given
        TripCreateDto tripCreateDto = new TripCreateDto();
        tripCreateDto.destinationSedeId = "SEDE-1";
        tripCreateDto.dateTime = "2024-01-15T08:00:00Z";
        tripCreateDto.seatsTotal = 4;
        tripCreateDto.direction = "TO_SEDE";
        
        TripCreateDto.Origin origin = new TripCreateDto.Origin();
        origin.lat = 40.4168;
        origin.lng = -3.7038;
        tripCreateDto.origin = origin;

        // When & Then
        assertEquals("SEDE-1", tripCreateDto.destinationSedeId);
        assertEquals("2024-01-15T08:00:00Z", tripCreateDto.dateTime);
        assertEquals(4, tripCreateDto.seatsTotal);
        assertEquals("TO_SEDE", tripCreateDto.direction);
        assertNotNull(tripCreateDto.origin);
        assertEquals(40.4168, tripCreateDto.origin.lat);
        assertEquals(-3.7038, tripCreateDto.origin.lng);
    }

    @Test
    void shouldCreateTripCreateDtoWithFromSedeDirection() {
        // Given
        TripCreateDto tripCreateDto = new TripCreateDto();
        tripCreateDto.direction = "FROM_SEDE";

        // When & Then
        assertEquals("FROM_SEDE", tripCreateDto.direction);
    }

    @Test
    void shouldCreateOriginWithCoordinates() {
        // Given
        TripCreateDto.Origin origin = new TripCreateDto.Origin();
        origin.lat = 41.3851;
        origin.lng = 2.1734;

        // When & Then
        assertEquals(41.3851, origin.lat);
        assertEquals(2.1734, origin.lng);
    }
}
