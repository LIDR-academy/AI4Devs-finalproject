package com.company.covoituraje.matching.api;

import java.util.List;

public class MatchDto {
    public String tripId;
    public String driverId;
    public String origin;
    public String destinationSedeId;
    public String dateTime;
    public int seatsFree;
    public double score;
    public String status;
    public List<String> reasons;
    public String direction; // TO_SEDE or FROM_SEDE
    public String pairedTripId; // Optional paired trip ID
}
