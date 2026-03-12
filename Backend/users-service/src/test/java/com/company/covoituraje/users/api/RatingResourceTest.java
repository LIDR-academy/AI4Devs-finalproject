package com.company.covoituraje.users.api;

import com.company.covoituraje.users.domain.Rating;
import com.company.covoituraje.users.infrastructure.RatingRepository;
import com.company.covoituraje.users.service.RatingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RatingResourceTest {

    private RatingRepository mockRepository;
    private RatingService mockRatingService;
    private RatingResource resource;

    @BeforeEach
    void setUp() {
        mockRepository = Mockito.mock(RatingRepository.class);
        mockRatingService = Mockito.mock(RatingService.class);
        resource = new RatingResource(mockRatingService);
        
        // Set up AuthContext
        RatingResource.AuthContext.setUserId("test-user-id");
    }

    @Test
    void createRating_shouldCreateNewRating() {
        // Arrange
        RatingCreateDto createDto = new RatingCreateDto();
        createDto.ratedId = "rated-user-id";
        createDto.ratingType = "THUMBS_UP";
        createDto.tags = Arrays.asList("punctual", "friendly");
        createDto.comment = "Great driver!";

        Rating savedRating = new Rating();
        savedRating.setId(UUID.randomUUID());
        savedRating.setRaterId("test-user-id");
        savedRating.setRatedId("rated-user-id");
        savedRating.setRatingType(Rating.RatingType.THUMBS_UP);
        savedRating.setTags(Arrays.asList("punctual", "friendly"));
        savedRating.setComment("Great driver!");

        when(mockRatingService.createRating(any(RatingCreateDto.class), anyString())).thenReturn(savedRating);

        // Act
        RatingDto result = resource.createRating(createDto);

        // Assert
        assertNotNull(result);
        assertEquals("test-user-id", result.raterId);
        assertEquals("rated-user-id", result.ratedId);
        assertEquals("THUMBS_UP", result.ratingType);
        assertEquals(Arrays.asList("punctual", "friendly"), result.tags);
        assertEquals("Great driver!", result.comment);
        
        verify(mockRatingService).createRating(createDto, "test-user-id");
    }

    @Test
    void getMyRatings_shouldReturnRatingsGivenByCurrentUser() {
        // Arrange
        Rating rating1 = new Rating();
        rating1.setId(UUID.randomUUID());
        rating1.setRaterId("test-user-id");
        rating1.setRatedId("user1");
        rating1.setRatingType(Rating.RatingType.THUMBS_UP);

        Rating rating2 = new Rating();
        rating2.setId(UUID.randomUUID());
        rating2.setRaterId("test-user-id");
        rating2.setRatedId("user2");
        rating2.setRatingType(Rating.RatingType.THUMBS_DOWN);

        List<Rating> ratings = Arrays.asList(rating1, rating2);
        when(mockRatingService.getRatingsByRater("test-user-id")).thenReturn(ratings);

        // Act
        List<RatingDto> result = resource.getMyRatings();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("THUMBS_UP", result.get(0).ratingType);
        assertEquals("THUMBS_DOWN", result.get(1).ratingType);
        
        verify(mockRatingService).getRatingsByRater("test-user-id");
    }

    @Test
    void getRatingsForUser_shouldReturnRatingsReceivedByUser() {
        // Arrange
        String userId = "target-user-id";
        Rating rating = new Rating();
        rating.setId(UUID.randomUUID());
        rating.setRaterId("rater-id");
        rating.setRatedId(userId);
        rating.setRatingType(Rating.RatingType.THUMBS_UP);

        List<Rating> ratings = Arrays.asList(rating);
        when(mockRatingService.getRatingsByRated(userId)).thenReturn(ratings);

        // Act
        List<RatingDto> result = resource.getRatingsForUser(userId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(userId, result.get(0).ratedId);
        
        verify(mockRatingService).getRatingsByRated(userId);
    }

    @Test
    void getTrustScore_shouldReturnTrustScoreForUser() {
        // Arrange
        String userId = "target-user-id";
        double expectedScore = 0.85;
        when(mockRatingService.getTrustScore(userId)).thenReturn(expectedScore);

        // Act
        double result = resource.getTrustScore(userId);

        // Assert
        assertEquals(expectedScore, result, 0.01);
        verify(mockRatingService).getTrustScore(userId);
    }

    @Test
    void getTrustStats_shouldReturnTrustStatistics() {
        // Arrange
        String userId = "target-user-id";
        RatingService.TrustStats expectedStats = new RatingService.TrustStats();
        expectedStats.totalRatings = 10;
        expectedStats.thumbsUp = 8;
        expectedStats.thumbsDown = 2;
        expectedStats.trustScore = 0.8;
        expectedStats.mostCommonTags = Arrays.asList("punctual", "friendly");

        when(mockRatingService.getTrustStats(userId)).thenReturn(expectedStats);

        // Act
        RatingService.TrustStats result = resource.getTrustStats(userId);

        // Assert
        assertNotNull(result);
        assertEquals(10, result.totalRatings);
        assertEquals(8, result.thumbsUp);
        assertEquals(2, result.thumbsDown);
        assertEquals(0.8, result.trustScore, 0.01);
        assertEquals(Arrays.asList("punctual", "friendly"), result.mostCommonTags);
        
        verify(mockRatingService).getTrustStats(userId);
    }
}
