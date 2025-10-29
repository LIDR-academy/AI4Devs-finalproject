package com.company.covoituraje.users.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class RatingTest {

    private Rating rating;

    @BeforeEach
    void setUp() {
        rating = new Rating();
        rating.setId(UUID.randomUUID());
        rating.setRaterId("rater-id");
        rating.setRatedId("rated-id");
        rating.setRatingType(Rating.RatingType.THUMBS_UP);
        rating.setTags(Arrays.asList("punctual", "friendly"));
        rating.setComment("Great driver!");
    }

    @Test
    void isThumbsUp_shouldReturnTrueForThumbsUpRating() {
        // Arrange
        rating.setRatingType(Rating.RatingType.THUMBS_UP);

        // Act & Assert
        assertTrue(rating.isThumbsUp());
        assertFalse(rating.isThumbsDown());
    }

    @Test
    void isThumbsDown_shouldReturnTrueForThumbsDownRating() {
        // Arrange
        rating.setRatingType(Rating.RatingType.THUMBS_DOWN);

        // Act & Assert
        assertTrue(rating.isThumbsDown());
        assertFalse(rating.isThumbsUp());
    }

    @Test
    void hasTag_shouldReturnTrueWhenTagExists() {
        // Arrange
        rating.setTags(Arrays.asList("punctual", "friendly", "safe"));

        // Act & Assert
        assertTrue(rating.hasTag("punctual"));
        assertTrue(rating.hasTag("friendly"));
        assertTrue(rating.hasTag("safe"));
        assertFalse(rating.hasTag("rude"));
    }

    @Test
    void hasTag_shouldReturnFalseWhenTagsIsNull() {
        // Arrange
        rating.setTags(null);

        // Act & Assert
        assertFalse(rating.hasTag("punctual"));
    }

    @Test
    void addTag_shouldAddNewTag() {
        // Arrange
        rating.setTags(Arrays.asList("punctual"));

        // Act
        rating.addTag("friendly");

        // Assert
        assertTrue(rating.getTags().contains("punctual"));
        assertTrue(rating.getTags().contains("friendly"));
        assertEquals(2, rating.getTags().size());
    }

    @Test
    void addTag_shouldNotAddDuplicateTag() {
        // Arrange
        rating.setTags(Arrays.asList("punctual"));

        // Act
        rating.addTag("punctual");

        // Assert
        assertEquals(1, rating.getTags().size());
        assertTrue(rating.getTags().contains("punctual"));
    }

    @Test
    void addTag_shouldHandleNullTagsList() {
        // Arrange
        rating.setTags(null);

        // Act
        rating.addTag("punctual");

        // Assert
        assertNull(rating.getTags()); // Should remain null
    }

    @Test
    void removeTag_shouldRemoveExistingTag() {
        // Arrange
        rating.setTags(Arrays.asList("punctual", "friendly"));

        // Act
        rating.removeTag("punctual");

        // Assert
        assertFalse(rating.getTags().contains("punctual"));
        assertTrue(rating.getTags().contains("friendly"));
        assertEquals(1, rating.getTags().size());
    }

    @Test
    void removeTag_shouldHandleNullTagsList() {
        // Arrange
        rating.setTags(null);

        // Act
        rating.removeTag("punctual");

        // Assert
        assertNull(rating.getTags()); // Should remain null
    }

    @Test
    void constructor_shouldSetAllFieldsCorrectly() {
        // Arrange
        String raterId = "rater-id";
        String ratedId = "rated-id";
        UUID tripId = UUID.randomUUID();
        Rating.RatingType ratingType = Rating.RatingType.THUMBS_UP;
        List<String> tags = Arrays.asList("punctual", "friendly");
        String comment = "Great driver!";

        // Act
        Rating newRating = new Rating(raterId, ratedId, tripId, ratingType, tags, comment);

        // Assert
        assertNotNull(newRating.getId());
        assertEquals(raterId, newRating.getRaterId());
        assertEquals(ratedId, newRating.getRatedId());
        assertEquals(tripId, newRating.getTripId());
        assertEquals(ratingType, newRating.getRatingType());
        assertEquals(tags, newRating.getTags());
        assertEquals(comment, newRating.getComment());
        assertNotNull(newRating.getCreatedAt());
        assertNotNull(newRating.getUpdatedAt());
    }

    @Test
    void gettersAndSetters_shouldWorkCorrectly() {
        // Arrange
        UUID id = UUID.randomUUID();
        String raterId = "new-rater-id";
        String ratedId = "new-rated-id";
        UUID tripId = UUID.randomUUID();
        Rating.RatingType ratingType = Rating.RatingType.THUMBS_DOWN;
        List<String> tags = Arrays.asList("rude", "unsafe");
        String comment = "Bad experience";

        // Act
        rating.setId(id);
        rating.setRaterId(raterId);
        rating.setRatedId(ratedId);
        rating.setTripId(tripId);
        rating.setRatingType(ratingType);
        rating.setTags(tags);
        rating.setComment(comment);

        // Assert
        assertEquals(id, rating.getId());
        assertEquals(raterId, rating.getRaterId());
        assertEquals(ratedId, rating.getRatedId());
        assertEquals(tripId, rating.getTripId());
        assertEquals(ratingType, rating.getRatingType());
        assertEquals(tags, rating.getTags());
        assertEquals(comment, rating.getComment());
    }
}









