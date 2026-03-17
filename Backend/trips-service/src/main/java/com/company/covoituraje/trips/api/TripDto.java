package com.company.covoituraje.trips.api;

public class TripDto {
    public String id;
    public String driverId;
    public Origin origin;
    public String destinationSedeId;
    public String dateTime; // ISO8601
    public int seatsTotal;
    public int seatsFree;
    public String direction; // TO_SEDE or FROM_SEDE
    public String pairedTripId; // Optional paired trip ID

    public static class Origin {
        public Double lat;
        public Double lng;
    }
}
