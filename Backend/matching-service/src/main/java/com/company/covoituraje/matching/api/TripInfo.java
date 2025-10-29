package com.company.covoituraje.matching.api;

public class TripInfo {
    public String id;
    public String driverId;
    public String origin;
    public String destinationSedeId;
    public String dateTime;
    public int seatsTotal;
    public int seatsFree;
    public String direction; // TO_SEDE or FROM_SEDE
    public String pairedTripId; // Optional paired trip ID
}
