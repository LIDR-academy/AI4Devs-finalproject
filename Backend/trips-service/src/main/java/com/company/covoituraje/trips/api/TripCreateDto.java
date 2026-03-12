package com.company.covoituraje.trips.api;

public class TripCreateDto {
    public TripDto.Origin origin;
    public String destinationSedeId;
    public String dateTime; // ISO8601
    public int seatsTotal;
}
