package com.company.covoituraje.booking.api;

public class BookingDto {
    public String id;
    public String tripId;
    public String passengerId;
    public Integer seatsRequested;
    public String status; // PENDING|CONFIRMED|CANCELLED|COMPLETED|NOSHOW
}
