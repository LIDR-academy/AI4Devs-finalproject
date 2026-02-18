package com.hexagonal.playback.infrastructure.in.rest.controller;

import com.hexagonal.meditationbuilder.MeditationBuilderApplication;
import com.hexagonal.playback.domain.ports.in.GetPlaybackInfoUseCase;
import com.hexagonal.playback.domain.ports.in.ListMeditationsUseCase;
import com.hexagonal.playback.domain.exception.MeditationNotFoundException;
import com.hexagonal.playback.domain.exception.MeditationNotPlayableException;
import com.hexagonal.playback.domain.model.Meditation;
import com.hexagonal.playback.domain.model.MediaUrls;
import com.hexagonal.playback.domain.model.ProcessingState;
import com.hexagonal.playback.infrastructure.in.rest.exception.PlaybackExceptionHandler;
import com.hexagonal.playback.infrastructure.in.rest.mapper.DtoMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for PlaybackController REST API.
 * Uses MockMvc to test HTTP layer.
 * 
 * TDD: Write tests FIRST → Implement controller → Tests GREEN
 */
@ContextConfiguration(classes = com.hexagonal.meditationbuilder.MeditationBuilderApplication.class)
@WebMvcTest(
    controllers = PlaybackController.class,
    excludeFilters = @Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = com.hexagonal.meditationbuilder.infrastructure.in.rest.controller.GlobalExceptionHandler.class
    )
)
@Import({DtoMapper.class, PlaybackExceptionHandler.class})
@DisplayName("PlaybackController REST API Tests")
class PlaybackControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ListMeditationsUseCase listMeditationsUseCase;

    @MockBean
    private GetPlaybackInfoUseCase getPlaybackInfoUseCase;

    @MockBean
    private Clock clock; // For PlaybackExceptionHandler

    private static final UUID USER_ID = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
    private static final UUID MEDITATION_ID_1 = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
    private static final UUID MEDITATION_ID_2 = UUID.fromString("550e8400-e29b-41d4-a716-446655440001");

    @BeforeEach
    void setUp() {
        // Configure Clock mock to return a fixed timestamp
        when(clock.instant()).thenReturn(Instant.parse("2026-02-17T00:00:00Z"));
    }

    // ==================== GET /api/v1/playback/meditations ====================

    @Test
    @DisplayName("GET /playback/meditations - Should return list of meditations ordered by createdAt DESC")
    void shouldReturnMeditationListOrderedByCreatedAtDesc() throws Exception {
        // Given
        Meditation completed = createMeditation(
            MEDITATION_ID_1, 
            "Morning Mindfulness", 
            ProcessingState.COMPLETED,
            Instant.parse("2026-02-16T10:30:00Z"),
            new MediaUrls("https://s3.aws.com/audio.mp3", "https://s3.aws.com/video.mp4", null)
        );
        
        Meditation processing = createMeditation(
            MEDITATION_ID_2,
            "Evening Relaxation",
            ProcessingState.PROCESSING,
            Instant.parse("2026-02-16T18:45:00Z"),
            null
        );

        when(listMeditationsUseCase.execute(USER_ID))
            .thenReturn(List.of(processing, completed)); // Most recent first

        // When/Then
        mockMvc.perform(get("/v1/playback/meditations")
                .header("X-User-Id", USER_ID.toString())
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.meditations", hasSize(2)))
            // First meditation (most recent)
            .andExpect(jsonPath("$.meditations[0].id").value(MEDITATION_ID_2.toString()))
            .andExpect(jsonPath("$.meditations[0].title").value("Evening Relaxation"))
            .andExpect(jsonPath("$.meditations[0].state").value("PROCESSING"))
            .andExpect(jsonPath("$.meditations[0].stateLabel").value("Generando"))
            .andExpect(jsonPath("$.meditations[0].createdAt").value("2026-02-16T18:45:00Z"))
            .andExpect(jsonPath("$.meditations[0].mediaUrls").doesNotExist())
            // Second meditation
            .andExpect(jsonPath("$.meditations[1].id").value(MEDITATION_ID_1.toString()))
            .andExpect(jsonPath("$.meditations[1].title").value("Morning Mindfulness"))
            .andExpect(jsonPath("$.meditations[1].state").value("COMPLETED"))
            .andExpect(jsonPath("$.meditations[1].stateLabel").value("Completada"))
            .andExpect(jsonPath("$.meditations[1].createdAt").value("2026-02-16T10:30:00Z"))
            .andExpect(jsonPath("$.meditations[1].mediaUrls.audioUrl").value("https://s3.aws.com/audio.mp3"))
            .andExpect(jsonPath("$.meditations[1].mediaUrls.videoUrl").value("https://s3.aws.com/video.mp4"))
            .andExpect(jsonPath("$.meditations[1].mediaUrls.subtitlesUrl").doesNotExist());
    }

    @Test
    @DisplayName("GET /playback/meditations - Should return empty list when user has no meditations")
    void shouldReturnEmptyListWhenUserHasNoMeditations() throws Exception {
        // Given
        when(listMeditationsUseCase.execute(USER_ID))
            .thenReturn(List.of());

        // When/Then
        mockMvc.perform(get("/v1/playback/meditations")
                .header("X-User-Id", USER_ID.toString())
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.meditations", hasSize(0)));
    }

    @Test
    @DisplayName("GET /playback/meditations - Should include all states with correct labels")
    void shouldIncludeAllStatesWithCorrectLabels() throws Exception {
        // Given
        List<Meditation> meditations = List.of(
            createMeditation(UUID.randomUUID(), "M1", ProcessingState.PENDING, Instant.now(), null),
            createMeditation(UUID.randomUUID(), "M2", ProcessingState.PROCESSING, Instant.now(), null),
            createMeditation(UUID.randomUUID(), "M3", ProcessingState.COMPLETED, Instant.now(), new MediaUrls("url", null, null)),
            createMeditation(UUID.randomUUID(), "M4", ProcessingState.FAILED, Instant.now(), null)
        );

        when(listMeditationsUseCase.execute(USER_ID))
            .thenReturn(meditations);

        // When/Then
        mockMvc.perform(get("/v1/playback/meditations")
                .header("X-User-Id", USER_ID.toString())
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.meditations", hasSize(4)))
            .andExpect(jsonPath("$.meditations[0].state").value("PENDING"))
            .andExpect(jsonPath("$.meditations[0].stateLabel").value("En cola"))
            .andExpect(jsonPath("$.meditations[1].state").value("PROCESSING"))
            .andExpect(jsonPath("$.meditations[1].stateLabel").value("Generando"))
            .andExpect(jsonPath("$.meditations[2].state").value("COMPLETED"))
            .andExpect(jsonPath("$.meditations[2].stateLabel").value("Completada"))
            .andExpect(jsonPath("$.meditations[3].state").value("FAILED"))
            .andExpect(jsonPath("$.meditations[3].stateLabel").value("Fallida"));
    }

    // ==================== GET /api/v1/playback/meditations/{id} ====================

    @Test
    @DisplayName("GET /playback/meditations/{id} - Should return playback info for completed meditation")
    void shouldReturnPlaybackInfoForCompletedMeditation() throws Exception {
        // Given
        Meditation meditation = createMeditation(
            MEDITATION_ID_1,
            "Morning Mindfulness",
            ProcessingState.COMPLETED,
            Instant.parse("2026-02-16T10:30:00Z"),
            new MediaUrls(
                "https://meditation-outputs.s3.amazonaws.com/audio.mp3",
                null,
                "https://meditation-outputs.s3.amazonaws.com/subs.srt"
            )
        );

        when(getPlaybackInfoUseCase.execute(MEDITATION_ID_1, USER_ID))
            .thenReturn(meditation);

        // When/Then
        mockMvc.perform(get("/v1/playback/meditations/{id}", MEDITATION_ID_1)
                .header("X-User-Id", USER_ID.toString())
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(MEDITATION_ID_1.toString()))
            .andExpect(jsonPath("$.title").value("Morning Mindfulness"))
            .andExpect(jsonPath("$.state").value("COMPLETED"))
            .andExpect(jsonPath("$.stateLabel").value("Completada"))
            .andExpect(jsonPath("$.createdAt").value("2026-02-16T10:30:00Z"))
            .andExpect(jsonPath("$.mediaUrls.audioUrl").value("https://meditation-outputs.s3.amazonaws.com/audio.mp3"))
            .andExpect(jsonPath("$.mediaUrls.videoUrl").doesNotExist())
            .andExpect(jsonPath("$.mediaUrls.subtitlesUrl").value("https://meditation-outputs.s3.amazonaws.com/subs.srt"));
    }

    @Test
    @DisplayName("GET /playback/meditations/{id} - Should return 404 when meditation not found")
    void shouldReturn404WhenMeditationNotFound() throws Exception {
        // Given
        UUID nonExistentId = UUID.randomUUID();
        when(getPlaybackInfoUseCase.execute(nonExistentId, USER_ID))
            .thenThrow(new MeditationNotFoundException(nonExistentId, USER_ID));

        // When/Then
        mockMvc.perform(get("/v1/playback/meditations/{id}", nonExistentId)
                .header("X-User-Id", USER_ID.toString())
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").value("Meditación no encontrada"))
            .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("GET /playback/meditations/{id} - Should return 409 when meditation not playable (PROCESSING)")
    void shouldReturn409WhenMeditationNotPlayable() throws Exception {
        // Given
        when(getPlaybackInfoUseCase.execute(MEDITATION_ID_1, USER_ID))
            .thenThrow(new MeditationNotPlayableException(MEDITATION_ID_1, ProcessingState.PROCESSING));

        // When/Then
        mockMvc.perform(get("/v1/playback/meditations/{id}", MEDITATION_ID_1)
                .header("X-User-Id", USER_ID.toString())
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("Esta meditación aún se está procesando. Por favor, espera a que esté lista."))
            .andExpect(jsonPath("$.timestamp").exists())
            .andExpect(jsonPath("$.details").value("Current state: Generando"));
    }

    @Test
    @DisplayName("GET /playback/meditations/{id} - Should return 409 when meditation failed")
    void shouldReturn409WhenMeditationFailed() throws Exception {
        // Given
        when(getPlaybackInfoUseCase.execute(MEDITATION_ID_1, USER_ID))
            .thenThrow(new MeditationNotPlayableException(MEDITATION_ID_1, ProcessingState.FAILED));

        // When/Then
        mockMvc.perform(get("/v1/playback/meditations/{id}", MEDITATION_ID_1)
                .header("X-User-Id", USER_ID.toString())
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("Error al generar la meditación. Por favor, inténtalo de nuevo."))
            .andExpect(jsonPath("$.timestamp").exists())
            .andExpect(jsonPath("$.details").value("Current state: Fallida"));
    }

    @Test
    @DisplayName("GET /playback/meditations/{id} - Should extract userId from header (not from request)")
    void shouldExtractUserIdFromHeader() throws Exception {
        // Given
        Meditation meditation = createMeditation(
            MEDITATION_ID_1,
            "Test",
            ProcessingState.COMPLETED,
            Instant.now(),
            new MediaUrls("url", null, null)
        );

        when(getPlaybackInfoUseCase.execute(any(UUID.class), any(UUID.class)))
            .thenReturn(meditation);

        // When/Then - UserId from X-User-Id header, not from path
        mockMvc.perform(get("/v1/playback/meditations/{id}", MEDITATION_ID_1)
                .header("X-User-Id", USER_ID.toString())
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk());
    }

    // ==================== Helper Methods ====================

    private Meditation createMeditation(UUID id, String title, ProcessingState state, Instant createdAt, MediaUrls mediaUrls) {
        return new Meditation(id, USER_ID, title, createdAt, state, mediaUrls);
    }
}

