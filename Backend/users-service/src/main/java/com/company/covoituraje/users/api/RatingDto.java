package com.company.covoituraje.users.api;

import com.company.covoituraje.users.domain.Rating;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class RatingDto {
    public UUID id;
    public String raterId;
    public String ratedId;
    public UUID tripId;
    public String ratingType;
    public List<String> tags;
    public String comment;
    public OffsetDateTime createdAt;
    public OffsetDateTime updatedAt;

    // Default constructor
    public RatingDto() {}

    // Constructor from Rating entity
    public RatingDto(Rating rating) {
        this.id = rating.getId();
        this.raterId = rating.getRaterId();
        this.ratedId = rating.getRatedId();
        this.tripId = rating.getTripId();
        this.ratingType = rating.getRatingType().name();
        this.tags = rating.getTags();
        this.comment = rating.getComment();
        this.createdAt = rating.getCreatedAt();
        this.updatedAt = rating.getUpdatedAt();
    }
}









