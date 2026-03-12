package com.company.covoituraje.users.api;

import java.util.List;
import java.util.UUID;

public class RatingCreateDto {
    public String ratedId;
    public UUID tripId;
    public String ratingType;
    public List<String> tags;
    public String comment;

    // Default constructor
    public RatingCreateDto() {}

    // Constructor with required fields
    public RatingCreateDto(String ratedId, String ratingType) {
        this.ratedId = ratedId;
        this.ratingType = ratingType;
    }
}


