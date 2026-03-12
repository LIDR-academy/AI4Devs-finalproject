package com.company.covoituraje.shared.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO compartido para información de trips entre servicios
 */
public class TripDto {
    
    @JsonProperty("id")
    public String id;
    
    @JsonProperty("driverId")
    public String driverId;
    
    @JsonProperty("origin")
    public Origin origin;
    
    @JsonProperty("destinationSedeId")
    public String destinationSedeId;
    
    @JsonProperty("dateTime")
    public String dateTime;
    
    @JsonProperty("seatsTotal")
    public Integer seatsTotal;
    
    @JsonProperty("seatsFree")
    public Integer seatsFree;
    
    @JsonProperty("createdAt")
    public String createdAt;
    
    @JsonProperty("updatedAt")
    public String updatedAt;
    
    public static class Origin {
        @JsonProperty("lat")
        public Double lat;
        
        @JsonProperty("lng")
        public Double lng;
    }
}
