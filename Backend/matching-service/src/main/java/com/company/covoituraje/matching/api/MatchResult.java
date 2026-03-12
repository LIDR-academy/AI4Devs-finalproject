package com.company.covoituraje.matching.api;

import java.util.List;

public class MatchResult {
    public String tripId;
    public String driverId;
    public String origin;
    public String destinationSedeId;
    public String dateTime;
    public int seatsFree;
    public double score;
    public List<String> reasons;
}
