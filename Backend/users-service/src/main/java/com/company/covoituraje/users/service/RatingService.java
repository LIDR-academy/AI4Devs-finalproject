package com.company.covoituraje.users.service;

import com.company.covoituraje.users.api.RatingCreateDto;
import com.company.covoituraje.users.domain.Rating;
import com.company.covoituraje.users.infrastructure.RatingRepository;

import java.util.List;
import java.util.UUID;

public class RatingService {
    
    private final RatingRepository ratingRepository;
    
    public RatingService(RatingRepository ratingRepository) {
        this.ratingRepository = ratingRepository;
    }
    
    /**
     * Create a new rating
     */
    public Rating createRating(RatingCreateDto createDto, String currentUserId) {
        // Validate that user is not rating themselves
        if (createDto.ratedId.equals(currentUserId)) {
            throw new IllegalArgumentException("Users cannot rate themselves");
        }
        
        // Check if rating already exists for this trip
        if (createDto.tripId != null) {
            var existingRating = ratingRepository.findByRaterIdAndRatedIdAndTripId(
                currentUserId, createDto.ratedId, createDto.tripId
            );
            if (existingRating.isPresent()) {
                throw new IllegalArgumentException("Rating already exists for this trip");
            }
        }
        
        // Create new rating
        Rating.RatingType ratingType = Rating.RatingType.valueOf(createDto.ratingType);
        Rating rating = new Rating(
            currentUserId,
            createDto.ratedId,
            createDto.tripId,
            ratingType,
            createDto.tags,
            createDto.comment
        );
        
        return ratingRepository.save(rating);
    }
    
    /**
     * Get ratings given by a user
     */
    public List<Rating> getRatingsByRater(String raterId) {
        return ratingRepository.findByRaterIdOrderByCreatedAtDesc(raterId);
    }
    
    /**
     * Get ratings received by a user
     */
    public List<Rating> getRatingsByRated(String ratedId) {
        return ratingRepository.findByRatedIdOrderByCreatedAtDesc(ratedId);
    }
    
    /**
     * Get trust score for a user
     */
    public double getTrustScore(String userId) {
        return ratingRepository.getTrustScoreByRatedId(userId);
    }
    
    /**
     * Get trust statistics for a user
     */
    public TrustStats getTrustStats(String userId) {
        long thumbsUp = ratingRepository.countThumbsUpByRatedId(userId);
        long thumbsDown = ratingRepository.countThumbsDownByRatedId(userId);
        double trustScore = ratingRepository.getTrustScoreByRatedId(userId);
        List<Object[]> tagStats = ratingRepository.getMostCommonTagsByRatedId(userId);
        
        TrustStats stats = new TrustStats();
        stats.totalRatings = thumbsUp + thumbsDown;
        stats.thumbsUp = thumbsUp;
        stats.thumbsDown = thumbsDown;
        stats.trustScore = trustScore;
        stats.mostCommonTags = tagStats.stream()
            .map(tag -> (String) tag[0])
            .toList();
        
        return stats;
    }
    
    /**
     * Trust statistics DTO
     */
    public static class TrustStats {
        public long totalRatings;
        public long thumbsUp;
        public long thumbsDown;
        public double trustScore;
        public List<String> mostCommonTags;
    }
}









