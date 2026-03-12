package com.company.covoituraje.booking.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "bookings", schema = "bookings")
public class Booking {
    
    @Id
    @Column(name = "id")
    private UUID id;
    
    @Column(name = "trip_id", nullable = false)
    private UUID tripId;
    
    @Column(name = "passenger_id", nullable = false)
    private String passengerId;
    
    @Column(name = "seats_requested", nullable = false)
    private Integer seatsRequested;
    
    @Column(name = "status", nullable = false, length = 50)
    private String status;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Default constructor for JPA
    public Booking() {}

    // Constructor for creating new bookings
    public Booking(UUID tripId, String passengerId, Integer seatsRequested, String status) {
        this.id = UUID.randomUUID();
        this.tripId = tripId;
        this.passengerId = passengerId;
        this.seatsRequested = seatsRequested;
        this.status = status;
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getTripId() { return tripId; }
    public void setTripId(UUID tripId) { this.tripId = tripId; }

    public String getPassengerId() { return passengerId; }
    public void setPassengerId(String passengerId) { this.passengerId = passengerId; }

    public Integer getSeatsRequested() { return seatsRequested; }
    public void setSeatsRequested(Integer seatsRequested) { this.seatsRequested = seatsRequested; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Business methods
    public boolean isPending() {
        return "PENDING".equals(status);
    }

    public boolean isConfirmed() {
        return "CONFIRMED".equals(status);
    }

    public boolean isCancelled() {
        return "CANCELLED".equals(status);
    }

    public void confirm() {
        this.status = "CONFIRMED";
        this.updatedAt = OffsetDateTime.now();
    }

    public void cancel() {
        this.status = "CANCELLED";
        this.updatedAt = OffsetDateTime.now();
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
