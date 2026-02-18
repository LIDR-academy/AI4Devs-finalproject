package com.hexagonal.playback.infrastructure.out.persistence;

import com.hexagonal.meditationbuilder.MeditationBuilderApplication;
import com.hexagonal.playback.domain.model.Meditation;
import com.hexagonal.playback.domain.model.ProcessingState;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Integration tests for PostgreSQL Meditation Repository Adapter.
 * Uses Testcontainers PostgreSQL to verify persistence layer.
 * Tests READ-ONLY operations on generation.meditation_output table (created by US3).
 */
@SpringBootTest(classes = MeditationBuilderApplication.class)
@Testcontainers
@ActiveProfiles("test")
@DisplayName("PostgreSQL Meditation Repository Adapter Integration Tests")
class PostgreSqlMeditationRepositoryAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("meditation_builder_test")
            .withUsername("testuser")
            .withPassword("testpass");

    static {
        postgres.start();
    }

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
        registry.add("spring.flyway.enabled", () -> "true");
    }

    @Autowired
    private PostgreSqlMeditationRepositoryAdapter adapter;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setUp() {
        // Clean database before each test
        jdbcTemplate.execute("DELETE FROM generation.meditation_output");
    }

    @Test
    @DisplayName("Should find all meditations for a specific user ordered by createdAt DESC")
    void shouldFindAllMeditationsByUserId() {
        // Given
        UUID userId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        Instant now = Instant.now();

        // Insert test data directly into database
        insertMeditation(UUID.randomUUID(), userId, "Latest Meditation", now, "COMPLETED", "http://audio1.url", null, "http://subs1.url");
        insertMeditation(UUID.randomUUID(), userId, "Older Meditation", now.minusSeconds(3600), "PROCESSING", null, null, null);
        insertMeditation(UUID.randomUUID(), userId, "Oldest Meditation", now.minusSeconds(7200), "FAILED", "http://audio2.url", null, null);
        insertMeditation(UUID.randomUUID(), otherUserId, "Other User Meditation", now, "COMPLETED", "http://audio3.url", null, null);

        // When
        List<Meditation> result = adapter.findAllByUserId(userId);

        // Then
        assertThat(result).hasSize(3);
        assertThat(result.get(0).title()).isEqualTo("Latest Meditation");
        assertThat(result.get(1).title()).isEqualTo("Older Meditation");
        assertThat(result.get(2).title()).isEqualTo("Oldest Meditation");
        assertThat(result).allMatch(m -> m.userId().equals(userId));
    }

    @Test
    @DisplayName("Should return empty list when user has no meditations")
    void shouldReturnEmptyListWhenUserHasNoMeditations() {
        // Given
        UUID userId = UUID.randomUUID();

        // When
        List<Meditation> result = adapter.findAllByUserId(userId);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should find meditation by ID and userId")
    void shouldFindMeditationByIdAndUserId() {
        // Given
        UUID meditationId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        // A meditation is either AUDIO or VIDEO. Testing AUDIO here as a representative format.
        insertMeditation(meditationId, userId, "Test Meditation", Instant.now(), "COMPLETED", "http://audio.url", null, "http://subs.url");

        // When
        Optional<Meditation> result = adapter.findByIdAndUserId(meditationId, userId);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().id()).isEqualTo(meditationId);
        assertThat(result.get().userId()).isEqualTo(userId);
        assertThat(result.get().title()).isEqualTo("Test Meditation");
        assertThat(result.get().processingState()).isEqualTo(ProcessingState.COMPLETED);
        assertThat(result.get().mediaUrls()).isNotNull();
        assertThat(result.get().mediaUrls().audioUrl()).isEqualTo("http://audio.url");
        assertThat(result.get().mediaUrls().videoUrl()).isNull();
        assertThat(result.get().mediaUrls().subtitlesUrl()).isEqualTo("http://subs.url");
    }

    @Test
    @DisplayName("Should return empty when meditation does not exist")
    void shouldReturnEmptyWhenMeditationDoesNotExist() {
        // Given
        UUID meditationId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        // When
        Optional<Meditation> result = adapter.findByIdAndUserId(meditationId, userId);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return empty when meditation belongs to different user")
    void shouldReturnEmptyWhenMeditationBelongsToDifferentUser() {
        // Given
        UUID meditationId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID differentUserId = UUID.randomUUID();
        insertMeditation(meditationId, userId, "Test", Instant.now(), "COMPLETED", "http://audio.url", null, null);

        // When
        Optional<Meditation> result = adapter.findByIdAndUserId(meditationId, differentUserId);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should map PROCESSING state correctly")
    void shouldMapProcessingStateCorrectly() {
        // Given
        UUID userId = UUID.randomUUID();
        insertMeditation(UUID.randomUUID(), userId, "Processing", Instant.now(), "PROCESSING", null, null, null);

        // When
        List<Meditation> result = adapter.findAllByUserId(userId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).processingState()).isEqualTo(ProcessingState.PROCESSING);
    }

    @Test
    @DisplayName("Should map COMPLETED state correctly")
    void shouldMapCompletedStateCorrectly() {
        // Given
        UUID userId = UUID.randomUUID();
        insertMeditation(UUID.randomUUID(), userId, "Completed", Instant.now(), "COMPLETED", "http://audio.url", null, null);

        // When
        List<Meditation> result = adapter.findAllByUserId(userId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).processingState()).isEqualTo(ProcessingState.COMPLETED);
    }

    @Test
    @DisplayName("Should map FAILED state correctly")
    void shouldMapFailedStateCorrectly() {
        // Given
        UUID userId = UUID.randomUUID();
        insertMeditation(UUID.randomUUID(), userId, "Failed", Instant.now(), "FAILED", null, null, null);

        // When
        List<Meditation> result = adapter.findAllByUserId(userId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).processingState()).isEqualTo(ProcessingState.FAILED);
    }

    @Test
    @DisplayName("Should map TIMEOUT state to FAILED")
    void shouldMapTimeoutStateToFailed() {
        // Given
        UUID userId = UUID.randomUUID();
        insertMeditation(UUID.randomUUID(), userId, "Timeout", Instant.now(), "TIMEOUT", null, null, null);

        // When
        List<Meditation> result = adapter.findAllByUserId(userId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).processingState()).isEqualTo(ProcessingState.FAILED);
    }

    @Test
    @DisplayName("Should handle meditation with only audio URL")
    void shouldHandleMeditationWithOnlyAudioUrl() {
        // Given
        UUID userId = UUID.randomUUID();
        insertMeditation(UUID.randomUUID(), userId, "Audio Only", Instant.now(), "COMPLETED", "http://audio.url", null, null);

        // When
        List<Meditation> result = adapter.findAllByUserId(userId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).mediaUrls()).isNotNull();
        assertThat(result.get(0).mediaUrls().audioUrl()).isEqualTo("http://audio.url");
        assertThat(result.get(0).mediaUrls().videoUrl()).isNull();
        assertThat(result.get(0).mediaUrls().hasAudio()).isTrue();
        assertThat(result.get(0).mediaUrls().hasVideo()).isFalse();
    }

    @Test
    @DisplayName("Should handle meditation with only video URL")
    void shouldHandleMeditationWithOnlyVideoUrl() {
        // Given
        UUID userId = UUID.randomUUID();
        insertMeditation(UUID.randomUUID(), userId, "Video Only", Instant.now(), "COMPLETED", null, "http://video.url", null);

        // When
        List<Meditation> result = adapter.findAllByUserId(userId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).mediaUrls()).isNotNull();
        assertThat(result.get(0).mediaUrls().audioUrl()).isNull();
        assertThat(result.get(0).mediaUrls().videoUrl()).isEqualTo("http://video.url");
        assertThat(result.get(0).mediaUrls().hasAudio()).isFalse();
        assertThat(result.get(0).mediaUrls().hasVideo()).isTrue();
    }

    @Test
    @DisplayName("Should handle meditation with null mediaUrls for non-completed states")
    void shouldHandleMeditationWithNullMediaUrlsForNonCompletedStates() {
        // Given
        UUID userId = UUID.randomUUID();
        insertMeditation(UUID.randomUUID(), userId, "Processing", Instant.now(), "PROCESSING", null, null, null);

        // When
        List<Meditation> result = adapter.findAllByUserId(userId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).mediaUrls()).isNull();
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when userId is null in findAllByUserId")
    void shouldThrowExceptionWhenUserIdIsNullInFindAll() {
        // When / Then
        assertThatThrownBy(() -> adapter.findAllByUserId(null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("userId cannot be null");
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when parameters are null in findByIdAndUserId")
    void shouldThrowExceptionWhenParametersAreNullInFindById() {
        // Given
        UUID validId = UUID.randomUUID();

        // When / Then - meditationId is null
        assertThatThrownBy(() -> adapter.findByIdAndUserId(null, validId))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("meditationId cannot be null");

        // When / Then - userId is null
        assertThatThrownBy(() -> adapter.findByIdAndUserId(validId, null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("userId cannot be null");
    }

    // Helper method to insert test data
    private void insertMeditation(UUID meditationId, UUID userId, String title, Instant createdAt, 
                                   String status, String audioUrl, String videoUrl, String subtitlesUrl) {
        String mediaType = "AUDIO";
        String mainUrl = audioUrl;
        
        if (audioUrl == null && videoUrl != null) {
            mediaType = "VIDEO";
            mainUrl = videoUrl;
        }

        jdbcTemplate.update(
            """
            INSERT INTO generation.meditation_output 
            (meditation_id, user_id, narration_script_text, created_at, status, 
             output_media_url, background_image_url, subtitle_url, 
             composition_id, idempotency_key, media_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            meditationId, userId, title, 
            java.sql.Timestamp.from(createdAt),  // Convert Instant to Timestamp for JDBC compatibility
            status,
            mainUrl, backgroundImageUrl(videoUrl), subtitlesUrl,
            UUID.randomUUID(), UUID.randomUUID().toString(), mediaType
        );
    }

    private String backgroundImageUrl(String videoUrl) {
        return videoUrl != null ? "http://background.url" : null;
    }
}
