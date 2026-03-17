package com.company.covoituraje.matching.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "matches", schema = "matches")
public class Match {
    
    @Id
    @Column(name = "id")
    private UUID id;
    
    @Column(name = "trip_id", nullable = false)
    private UUID tripId;
    
    @Column(name = "passenger_id", nullable = false)
    private String passengerId;
    
    @Column(name = "driver_id", nullable = false)
    private String driverId;
    
    @Column(name = "match_score", nullable = false, precision = 3, scale = 2)
    private BigDecimal matchScore;
    
    @Column(name = "status", nullable = false, length = 50)
    private String status;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Default constructor for JPA
    public Match() {}

    // Constructor for creating new matches
    public Match(UUID tripId, String passengerId, String driverId, BigDecimal matchScore, String status) {
        this.id = UUID.randomUUID();
        this.tripId = tripId;
        this.passengerId = passengerId;
        this.driverId = driverId;
        this.matchScore = matchScore;
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

    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }

    public BigDecimal getMatchScore() { return matchScore; }
    public void setMatchScore(BigDecimal matchScore) { this.matchScore = matchScore; }

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

    public boolean isAccepted() {
        return "ACCEPTED".equals(status);
    }

    public boolean isRejected() {
        return "REJECTED".equals(status);
    }

    public void accept() {
        this.status = "ACCEPTED";
        this.updatedAt = OffsetDateTime.now();
    }

    public void reject() {
        this.status = "REJECTED";
        this.updatedAt = OffsetDateTime.now();
    }

    public boolean isHighScore() {
        return matchScore.compareTo(new BigDecimal("0.8")) >= 0;
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
