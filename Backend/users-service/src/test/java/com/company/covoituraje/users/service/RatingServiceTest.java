package com.company.covoituraje.users.service;

import com.company.covoituraje.users.api.RatingCreateDto;
import com.company.covoituraje.users.domain.Rating;
import com.company.covoituraje.users.infrastructure.RatingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RatingServiceTest {

    private RatingRepository mockRepository;
    private RatingService ratingService;

    @BeforeEach
    void setUp() {
        mockRepository = Mockito.mock(RatingRepository.class);
        ratingService = new RatingService(mockRepository);
    }

    @Test
    void createRating_shouldCreateAndSaveRating() {
        // Arrange
        RatingCreateDto createDto = new RatingCreateDto();
        createDto.ratedId = "rated-user-id";
        createDto.ratingType = "THUMBS_UP";
        createDto.tags = Arrays.asList("punctual", "friendly");
        createDto.comment = "Great driver!";

        Rating savedRating = new Rating();
        savedRating.setId(UUID.randomUUID());
        savedRating.setRaterId("current-user-id");
        savedRating.setRatedId("rated-user-id");
        savedRating.setRatingType(Rating.RatingType.THUMBS_UP);
        savedRating.setTags(Arrays.asList("punctual", "friendly"));
        savedRating.setComment("Great driver!");

        when(mockRepository.save(any(Rating.class))).thenReturn(savedRating);

        // Act
        Rating result = ratingService.createRating(createDto, "current-user-id");

        // Assert
        assertNotNull(result);
        assertEquals("current-user-id", result.getRaterId());
        assertEquals("rated-user-id", result.getRatedId());
        assertEquals(Rating.RatingType.THUMBS_UP, result.getRatingType());
        assertEquals(Arrays.asList("punctual", "friendly"), result.getTags());
        assertEquals("Great driver!", result.getComment());
        
        verify(mockRepository).save(any(Rating.class));
    }

    @Test
    void getRatingsByRater_shouldReturnRatingsGivenByUser() {
        // Arrange
        String raterId = "rater-user-id";
        Rating rating1 = new Rating();
        rating1.setId(UUID.randomUUID());
        rating1.setRaterId(raterId);
        rating1.setRatedId("user1");
        rating1.setRatingType(Rating.RatingType.THUMBS_UP);

        Rating rating2 = new Rating();
        rating2.setId(UUID.randomUUID());
        rating2.setRaterId(raterId);
        rating2.setRatedId("user2");
        rating2.setRatingType(Rating.RatingType.THUMBS_DOWN);

        List<Rating> expectedRatings = Arrays.asList(rating1, rating2);
        when(mockRepository.findByRaterIdOrderByCreatedAtDesc(raterId)).thenReturn(expectedRatings);

        // Act
        List<Rating> result = ratingService.getRatingsByRater(raterId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(raterId, result.get(0).getRaterId());
        assertEquals(raterId, result.get(1).getRaterId());
        
        verify(mockRepository).findByRaterIdOrderByCreatedAtDesc(raterId);
    }

    @Test
    void getRatingsByRated_shouldReturnRatingsReceivedByUser() {
        // Arrange
        String ratedId = "rated-user-id";
        Rating rating = new Rating();
        rating.setId(UUID.randomUUID());
        rating.setRaterId("rater-id");
        rating.setRatedId(ratedId);
        rating.setRatingType(Rating.RatingType.THUMBS_UP);

        List<Rating> expectedRatings = Arrays.asList(rating);
        when(mockRepository.findByRatedIdOrderByCreatedAtDesc(ratedId)).thenReturn(expectedRatings);

        // Act
        List<Rating> result = ratingService.getRatingsByRated(ratedId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(ratedId, result.get(0).getRatedId());
        
        verify(mockRepository).findByRatedIdOrderByCreatedAtDesc(ratedId);
    }

    @Test
    void getTrustScore_shouldReturnCorrectTrustScore() {
        // Arrange
        String userId = "target-user-id";
        double expectedScore = 0.75;
        when(mockRepository.getTrustScoreByRatedId(userId)).thenReturn(expectedScore);

        // Act
        double result = ratingService.getTrustScore(userId);

        // Assert
        assertEquals(expectedScore, result, 0.01);
        verify(mockRepository).getTrustScoreByRatedId(userId);
    }

    @Test
    void getTrustStats_shouldReturnCompleteTrustStatistics() {
        // Arrange
        String userId = "target-user-id";
        long thumbsUp = 8L;
        long thumbsDown = 2L;
        double trustScore = 0.8;
        List<Object[]> tagStats = Arrays.asList(
            new Object[]{"punctual", 5L},
            new Object[]{"friendly", 3L}
        );

        when(mockRepository.countThumbsUpByRatedId(userId)).thenReturn(thumbsUp);
        when(mockRepository.countThumbsDownByRatedId(userId)).thenReturn(thumbsDown);
        when(mockRepository.getTrustScoreByRatedId(userId)).thenReturn(trustScore);
        when(mockRepository.getMostCommonTagsByRatedId(userId)).thenReturn(tagStats);

        // Act
        RatingService.TrustStats result = ratingService.getTrustStats(userId);

        // Assert
        assertNotNull(result);
        assertEquals(10, result.totalRatings);
        assertEquals(8, result.thumbsUp);
        assertEquals(2, result.thumbsDown);
        assertEquals(0.8, result.trustScore, 0.01);
        assertEquals(Arrays.asList("punctual", "friendly"), result.mostCommonTags);
        
        verify(mockRepository).countThumbsUpByRatedId(userId);
        verify(mockRepository).countThumbsDownByRatedId(userId);
        verify(mockRepository).getTrustScoreByRatedId(userId);
        verify(mockRepository).getMostCommonTagsByRatedId(userId);
    }
}


