package com.company.covoituraje.users.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ratings", schema = "users")
public class Rating {
    
    @Id
    @Column(name = "id")
    private UUID id;
    
    @Column(name = "rater_id", nullable = false)
    private String raterId;
    
    @Column(name = "rated_id", nullable = false)
    private String ratedId;
    
    @Column(name = "trip_id")
    private UUID tripId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "rating_type", nullable = false)
    private RatingType ratingType;
    
    @ElementCollection
    @CollectionTable(name = "rating_tags", schema = "users", joinColumns = @JoinColumn(name = "rating_id"))
    @Column(name = "tag")
    private List<String> tags;
    
    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Default constructor for JPA
    public Rating() {}

    // Constructor for creating new ratings
    public Rating(String raterId, String ratedId, UUID tripId, RatingType ratingType, List<String> tags, String comment) {
        this.id = UUID.randomUUID();
        this.raterId = raterId;
        this.ratedId = ratedId;
        this.tripId = tripId;
        this.ratingType = ratingType;
        this.tags = tags;
        this.comment = comment;
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    // Business methods
    public boolean isThumbsUp() {
        return ratingType == RatingType.THUMBS_UP;
    }

    public boolean isThumbsDown() {
        return ratingType == RatingType.THUMBS_DOWN;
    }

    public boolean hasTag(String tag) {
        return tags != null && tags.contains(tag);
    }

    public void addTag(String tag) {
        if (tags != null && !tags.contains(tag)) {
            tags = new ArrayList<>(tags);
            tags.add(tag);
        }
    }

    public void removeTag(String tag) {
        if (tags != null) {
            tags = new ArrayList<>(tags);
            tags.remove(tag);
        }
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getRaterId() { return raterId; }
    public void setRaterId(String raterId) { this.raterId = raterId; }

    public String getRatedId() { return ratedId; }
    public void setRatedId(String ratedId) { this.ratedId = ratedId; }

    public UUID getTripId() { return tripId; }
    public void setTripId(UUID tripId) { this.tripId = tripId; }

    public RatingType getRatingType() { return ratingType; }
    public void setRatingType(RatingType ratingType) { this.ratingType = ratingType; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    // RatingType enum
    public enum RatingType {
        THUMBS_UP,
        THUMBS_DOWN
    }
}
