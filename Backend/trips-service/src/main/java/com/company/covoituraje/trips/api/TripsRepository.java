package com.company.covoituraje.trips.api;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class TripsRepository {
    private static final List<TripDto> TRIPS = new ArrayList<>();

    static {
        // seed 2 trips for SEDE-1
        TripDto t1 = new TripDto();
        t1.id = java.util.UUID.randomUUID().toString();
        t1.driverId = java.util.UUID.randomUUID().toString();
        t1.destinationSedeId = "SEDE-1";
        t1.dateTime = "2025-10-06T08:30:00Z";
        t1.seatsTotal = 3;
        t1.seatsFree = 3;
        TRIPS.add(t1);

        TripDto t2 = new TripDto();
        t2.id = java.util.UUID.randomUUID().toString();
        t2.driverId = java.util.UUID.randomUUID().toString();
        t2.destinationSedeId = "SEDE-1";
        t2.dateTime = "2025-10-06T09:00:00Z";
        t2.seatsTotal = 2;
        t2.seatsFree = 2;
        TRIPS.add(t2);
    }

    public List<TripDto> listAll() {
        return Collections.unmodifiableList(TRIPS);
    }

    public TripDto save(TripDto dto) {
        TRIPS.add(dto);
        return dto;
    }
}
