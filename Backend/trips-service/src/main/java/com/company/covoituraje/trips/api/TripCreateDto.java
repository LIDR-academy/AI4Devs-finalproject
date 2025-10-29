package com.company.covoituraje.trips.api;

public class TripCreateDto {
    public Origin origin;
    public String destinationSedeId;
    public String dateTime; // ISO8601
    public int seatsTotal;
    public String direction; // TO_SEDE or FROM_SEDE

    public static class Origin {
        public Double lat;
        public Double lng;
    }
}
