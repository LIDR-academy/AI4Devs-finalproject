package com.company.covoituraje.trips.domain;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;
import java.time.OffsetDateTime;
import java.util.UUID;

class TripTest {

    private Trip trip;
    private final String driverId = "driver-123";
    private final String origin = "40.4168,-3.7038";
    private final String destinationSedeId = "SEDE-1";
    private final OffsetDateTime dateTime = OffsetDateTime.now().plusDays(1);
    private final Integer seatsTotal = 4;

    @BeforeEach
    void setUp() {
        trip = new Trip(driverId, origin, destinationSedeId, dateTime, seatsTotal, Trip.Direction.TO_SEDE);
    }

    @Test
    void shouldCreateTripWithDirection() {
        // When & Then
        assertEquals(driverId, trip.getDriverId());
        assertEquals(origin, trip.getOrigin());
        assertEquals(destinationSedeId, trip.getDestinationSedeId());
        assertEquals(dateTime, trip.getDateTime());
        assertEquals(seatsTotal, trip.getSeatsTotal());
        assertEquals(seatsTotal, trip.getSeatsFree());
        assertEquals(Trip.Direction.TO_SEDE, trip.getDirection());
        assertNull(trip.getPairedTripId());
        assertNotNull(trip.getId());
        assertNotNull(trip.getCreatedAt());
        assertNotNull(trip.getUpdatedAt());
    }

    @Test
    void shouldCreateTripWithFromSedeDirection() {
        // Given
        Trip fromSedeTrip = new Trip(driverId, origin, destinationSedeId, dateTime, seatsTotal, Trip.Direction.FROM_SEDE);

        // When & Then
        assertEquals(Trip.Direction.FROM_SEDE, fromSedeTrip.getDirection());
    }

    @Test
    void shouldCreateTripWithPairedTripId() {
        // Given
        UUID pairedTripId = UUID.randomUUID();
        Trip pairedTrip = new Trip(driverId, origin, destinationSedeId, dateTime, seatsTotal, Trip.Direction.TO_SEDE, pairedTripId);

        // When & Then
        assertEquals(pairedTripId, pairedTrip.getPairedTripId());
        assertEquals(Trip.Direction.TO_SEDE, pairedTrip.getDirection());
    }

    @Test
    void shouldSetAndGetDirection() {
        // When
        trip.setDirection(Trip.Direction.FROM_SEDE);

        // Then
        assertEquals(Trip.Direction.FROM_SEDE, trip.getDirection());
    }

    @Test
    void shouldSetAndGetPairedTripId() {
        // Given
        UUID pairedTripId = UUID.randomUUID();

        // When
        trip.setPairedTripId(pairedTripId);

        // Then
        assertEquals(pairedTripId, trip.getPairedTripId());
    }

    @Test
    void shouldHaveFreeSeatsInitially() {
        // When & Then
        assertTrue(trip.hasFreeSeats());
        assertTrue(trip.canAccommodate(2));
        assertTrue(trip.canAccommodate(4));
        assertFalse(trip.canAccommodate(5));
    }

    @Test
    void shouldReserveSeats() {
        // When
        trip.reserveSeats(2);

        // Then
        assertEquals(2, trip.getSeatsFree());
        assertTrue(trip.hasFreeSeats());
        assertTrue(trip.canAccommodate(2));
        assertFalse(trip.canAccommodate(3));
    }

    @Test
    void shouldThrowExceptionWhenReservingTooManySeats() {
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> trip.reserveSeats(5)
        );
        assertEquals("Not enough free seats available", exception.getMessage());
    }

    @Test
    void shouldReleaseSeats() {
        // Given
        trip.reserveSeats(2);

        // When
        trip.releaseSeats(1);

        // Then
        assertEquals(3, trip.getSeatsFree());
    }

    @Test
    void shouldThrowExceptionWhenReleasingInvalidSeats() {
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> trip.releaseSeats(5)
        );
        assertEquals("Invalid number of seats to release", exception.getMessage());
    }

    @Test
    void shouldUpdateTimestampOnSeatReservation() throws InterruptedException {
        // Given
        OffsetDateTime originalUpdatedAt = trip.getUpdatedAt();

        // When
        Thread.sleep(1); // Ensure time difference
        trip.reserveSeats(1);

        // Then
        assertTrue(trip.getUpdatedAt().isAfter(originalUpdatedAt));
    }
}
