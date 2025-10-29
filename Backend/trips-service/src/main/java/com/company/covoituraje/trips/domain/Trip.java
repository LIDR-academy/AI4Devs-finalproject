package com.company.covoituraje.trips.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "trips", schema = "trips")
public class Trip {
    
    public enum Direction {
        TO_SEDE, FROM_SEDE
    }
    
    @Id
    @Column(name = "id")
    private UUID id;
    
    @Column(name = "driver_id", nullable = false)
    private String driverId;
    
    @Column(name = "origin", nullable = false)
    private String origin;
    
    @Column(name = "destination_sede_id", nullable = false)
    private String destinationSedeId;
    
    @Column(name = "date_time", nullable = false)
    private OffsetDateTime dateTime;
    
    @Column(name = "seats_total", nullable = false)
    private Integer seatsTotal;
    
    @Column(name = "seats_free", nullable = false)
    private Integer seatsFree;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "direction", nullable = false)
    private Direction direction;
    
    @Column(name = "paired_trip_id")
    private UUID pairedTripId;

    // Default constructor for JPA
    public Trip() {}

    // Constructor for creating new trips
    public Trip(String driverId, String origin, String destinationSedeId, 
                OffsetDateTime dateTime, Integer seatsTotal, Direction direction) {
        this.id = UUID.randomUUID();
        this.driverId = driverId;
        this.origin = origin;
        this.destinationSedeId = destinationSedeId;
        this.dateTime = dateTime;
        this.seatsTotal = seatsTotal;
        this.seatsFree = seatsTotal; // Initially all seats are free
        this.direction = direction;
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }
    
    // Constructor for creating new trips with paired trip
    public Trip(String driverId, String origin, String destinationSedeId, 
                OffsetDateTime dateTime, Integer seatsTotal, Direction direction, UUID pairedTripId) {
        this(driverId, origin, destinationSedeId, dateTime, seatsTotal, direction);
        this.pairedTripId = pairedTripId;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public String getDestinationSedeId() { return destinationSedeId; }
    public void setDestinationSedeId(String destinationSedeId) { this.destinationSedeId = destinationSedeId; }

    public OffsetDateTime getDateTime() { return dateTime; }
    public void setDateTime(OffsetDateTime dateTime) { this.dateTime = dateTime; }

    public Integer getSeatsTotal() { return seatsTotal; }
    public void setSeatsTotal(Integer seatsTotal) { this.seatsTotal = seatsTotal; }

    public Integer getSeatsFree() { return seatsFree; }
    public void setSeatsFree(Integer seatsFree) { this.seatsFree = seatsFree; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Direction getDirection() { return direction; }
    public void setDirection(Direction direction) { this.direction = direction; }
    
    public UUID getPairedTripId() { return pairedTripId; }
    public void setPairedTripId(UUID pairedTripId) { this.pairedTripId = pairedTripId; }

    // Business methods
    public boolean hasFreeSeats() {
        return seatsFree != null && seatsFree > 0;
    }

    public boolean canAccommodate(int requestedSeats) {
        return seatsFree != null && seatsFree >= requestedSeats;
    }

    public void reserveSeats(int seatsToReserve) {
        if (canAccommodate(seatsToReserve)) {
            this.seatsFree -= seatsToReserve;
            this.updatedAt = OffsetDateTime.now();
        } else {
            throw new IllegalArgumentException("Not enough free seats available");
        }
    }

    public void releaseSeats(int seatsToRelease) {
        if (seatsToRelease > 0 && (this.seatsFree + seatsToRelease) <= this.seatsTotal) {
            this.seatsFree += seatsToRelease;
            this.updatedAt = OffsetDateTime.now();
        } else {
            throw new IllegalArgumentException("Invalid number of seats to release");
        }
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = OffsetDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
