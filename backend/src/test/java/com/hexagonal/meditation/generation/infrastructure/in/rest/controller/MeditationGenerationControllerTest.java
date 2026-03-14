package com.hexagonal.meditation.generation.infrastructure.in.rest.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hexagonal.meditation.generation.domain.enums.GenerationStatus;
import com.hexagonal.meditation.generation.domain.exception.GenerationTimeoutException;
import com.hexagonal.meditation.generation.domain.exception.InvalidContentException;
import com.hexagonal.meditation.generation.domain.ports.in.GenerateMeditationContentUseCase;
import com.hexagonal.meditation.generation.domain.ports.in.GenerateMeditationContentUseCase.GenerationRequest;
import com.hexagonal.meditation.generation.domain.ports.in.GenerateMeditationContentUseCase.GenerationResponse;
import com.hexagonal.meditation.generation.domain.ports.out.ContentRepositoryPort;
import com.hexagonal.meditation.generation.infrastructure.in.rest.dto.GenerateMeditationRequest;
import com.hexagonal.meditation.generation.infrastructure.in.rest.mapper.MeditationOutputDtoMapper;
import com.hexagonal.meditation.generation.infrastructure.out.persistence.repository.JpaMeditationOutputRepository;
import com.hexagonal.meditationbuilder.MeditationBuilderApplication;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for MeditationGenerationController.
 * 
 * Uses @WebMvcTest for lightweight controller testing.
 * Mocks GenerateMeditationContentUseCase to isolate controller logic.
 * 
 * Test scenarios:
 * - Happy path: VIDEO generation (with image)
 * - Happy path: AUDIO generation (without image)
 * - Error: Processing timeout (408)
 * - Error: Invalid content (400)
 * - Error: External service failure (503)
 * 
 * Authentication: Bypassed via SecurityMockMvcRequestPostProcessors in each test.
 */
@ContextConfiguration(classes = MeditationBuilderApplication.class)
@WebMvcTest(controllers = MeditationGenerationController.class)
@Import(MeditationOutputDtoMapper.class)
@DisplayName("MeditationGenerationController Tests")
class MeditationGenerationControllerTest {

    /**
     * Test-specific security config: disables CSRF and uses session-based context
     * so that SecurityMockMvcRequestPostProcessors.authentication() works correctly
     * with MockMvc POST requests (bypasses the STATELESS session policy in production).
     */
    @TestConfiguration
    static class TestSecurityConfig {
        @Bean("testGenerationSecurityFilterChain")
        @Order(Integer.MIN_VALUE)
        public SecurityFilterChain testFilterChain(HttpSecurity http) throws Exception {
            http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated());
            return http.build();
        }
    }

    private static final Instant FIXED_NOW = Instant.parse("2026-01-01T00:00:00Z");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GenerateMeditationContentUseCase generateMeditationContentUseCase;

    @MockBean
    private ContentRepositoryPort contentRepositoryPort;

    @MockBean
    private JpaMeditationOutputRepository jpaMeditationOutputRepository;

    @MockBean
    private Clock clock;

    @Nested
    @DisplayName("POST /v1/generation/meditations")
    class GenerateMeditationContent {

        @Test
        @DisplayName("should generate VIDEO when image reference is provided")
        void shouldGenerateVideoWhenImageReferenceIsProvided() throws Exception {
            // Given
            UUID userId = UUID.randomUUID();
            UUID compositionId = UUID.randomUUID();
            UUID meditationId = UUID.randomUUID();

            GenerateMeditationRequest request = new GenerateMeditationRequest(
                    "Close your eyes and breathe deeply",
                    "calm-ocean-waves",
                    "peaceful-landscape-001"
            );

            GenerationResponse domainResponse = new GenerationResponse(
                    meditationId,
                    compositionId,
                    userId,
                    GenerationStatus.COMPLETED,
                    com.hexagonal.meditation.generation.domain.enums.MediaType.VIDEO,
                    "https://s3.amazonaws.com/meditation-outputs/generation/user-123/video.mp4",
                    "https://s3.amazonaws.com/meditation-outputs/generation/user-123/subs.srt",
                    180,
                    FIXED_NOW,
                    FIXED_NOW
            );

            when(generateMeditationContentUseCase.generate(any(GenerationRequest.class)))
                    .thenReturn(domainResponse);

            // When/Then
            mockMvc.perform(post("/v1/generation/meditations")
                            .with(csrf()).with(authentication(new UsernamePasswordAuthenticationToken(userId.toString(), null, List.of())))
                            .header("X-Composition-ID", compositionId.toString())
                            .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.meditationId").value(meditationId.toString()))
                    .andExpect(jsonPath("$.type").value("VIDEO"))
                    .andExpect(jsonPath("$.mediaUrl").value(domainResponse.mediaUrl()))
                    .andExpect(jsonPath("$.subtitleUrl").value(domainResponse.subtitleUrl()))
                    .andExpect(jsonPath("$.durationSeconds").value(180))
                    .andExpect(jsonPath("$.status").value("COMPLETED"))
                    .andExpect(jsonPath("$.message").value("Generation completed successfully"));
        }

        @Test
        @DisplayName("should generate AUDIO when image reference is null")
        void shouldGenerateAudioWhenImageReferenceIsNull() throws Exception {
            // Given
            UUID userId = UUID.randomUUID();
            UUID compositionId = UUID.randomUUID();
            UUID meditationId = UUID.randomUUID();

            GenerateMeditationRequest request = new GenerateMeditationRequest(
                    "Welcome to your mindfulness meditation journey",
                    "nature-sounds-forest",
                    null
            );

            GenerationResponse domainResponse = new GenerationResponse(
                    meditationId,
                    compositionId,
                    userId,
                    GenerationStatus.COMPLETED,
                    com.hexagonal.meditation.generation.domain.enums.MediaType.AUDIO,
                    "https://s3.amazonaws.com/meditation-outputs/generation/user-456/audio.mp3",
                    "https://s3.amazonaws.com/meditation-outputs/generation/user-456/subs.srt",
                    240,
                    FIXED_NOW,
                    FIXED_NOW
            );

            when(generateMeditationContentUseCase.generate(any(GenerationRequest.class)))
                    .thenReturn(domainResponse);

            // When/Then
            mockMvc.perform(post("/v1/generation/meditations")
                            .with(csrf()).with(authentication(new UsernamePasswordAuthenticationToken(userId.toString(), null, List.of())))
                            .header("X-Composition-ID", compositionId.toString())
                            .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.meditationId").value(meditationId.toString()))
                    .andExpect(jsonPath("$.type").value("AUDIO"))
                    .andExpect(jsonPath("$.mediaUrl").value(domainResponse.mediaUrl()))
                    .andExpect(jsonPath("$.durationSeconds").value(240))
                    .andExpect(jsonPath("$.status").value("COMPLETED"));
        }

        @Test
        @DisplayName("should return 408 timeout when processing time exceeds threshold")
        void shouldReturn408TimeoutWhenProcessingTimeExceedsThreshold() throws Exception {
            // Given
            UUID userId = UUID.randomUUID();
            UUID compositionId = UUID.randomUUID();

            GenerateMeditationRequest request = new GenerateMeditationRequest(
                    "Very long meditation text that would exceed processing time limit...",
                    "calm-music",
                    null
            );

            when(generateMeditationContentUseCase.generate(any(GenerationRequest.class)))
                    .thenThrow(new GenerationTimeoutException(
                            "Processing time would exceed 187 seconds. Estimated: 200s"));

            // When/Then
            mockMvc.perform(post("/v1/generation/meditations")
                            .with(csrf()).with(authentication(new UsernamePasswordAuthenticationToken(userId.toString(), null, List.of())))
                            .header("X-Composition-ID", compositionId.toString())
                            .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isRequestTimeout())
                    .andExpect(jsonPath("$.error").value("GENERATION_TIMEOUT"))
                    .andExpect(jsonPath("$.message").value("Processing time would exceed 187 seconds. Estimated: 200s"));
        }

        @Test
        @DisplayName("should return 400 bad request when content validation fails")
        void shouldReturn400BadRequestWhenContentValidationFails() throws Exception {
            // Given
            UUID userId = UUID.randomUUID();
            UUID compositionId = UUID.randomUUID();

            GenerateMeditationRequest request = new GenerateMeditationRequest(
                    "Meditation text",
                    "invalid-music-reference",
                    null
            );

            when(generateMeditationContentUseCase.generate(any(GenerationRequest.class)))
                    .thenThrow(new InvalidContentException("Music reference not found in media catalog"));

            // When/Then
            mockMvc.perform(post("/v1/generation/meditations")
                            .with(csrf()).with(authentication(new UsernamePasswordAuthenticationToken(userId.toString(), null, List.of())))
                            .header("X-Composition-ID", compositionId.toString())
                            .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("INVALID_CONTENT"))
                    .andExpect(jsonPath("$.message").value("Music reference not found in media catalog"));
        }

        @Test
        @DisplayName("should return 503 service unavailable when external service fails")
        void shouldReturn503ServiceUnavailableWhenExternalServiceFails() throws Exception {
            // Given
            UUID userId = UUID.randomUUID();
            UUID compositionId = UUID.randomUUID();

            GenerateMeditationRequest request = new GenerateMeditationRequest(
                    "Meditation text",
                    "calm-music",
                    null
            );

            when(generateMeditationContentUseCase.generate(any(GenerationRequest.class)))
                    .thenThrow(new RuntimeException("TTS service unavailable"));

            // When/Then
            mockMvc.perform(post("/v1/generation/meditations")
                            .with(csrf()).with(authentication(new UsernamePasswordAuthenticationToken(userId.toString(), null, List.of())))
                            .header("X-Composition-ID", compositionId.toString())
                            .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isServiceUnavailable())
                    .andExpect(jsonPath("$.error").value("GENERATION_FAILED"))
                    .andExpect(jsonPath("$.message").value("An error occurred during generation: TTS service unavailable"));
        }

        @Test
        @DisplayName("should return 400 bad request when request validation fails (blank text)")
        void shouldReturn400BadRequestWhenRequestValidationFails() throws Exception {
            // Given
            UUID userId = UUID.randomUUID();
            UUID compositionId = UUID.randomUUID();

            GenerateMeditationRequest request = new GenerateMeditationRequest(
                    "",  // Blank text violates @NotBlank
                    "calm-music",
                    null
            );

            // When/Then
            mockMvc.perform(post("/v1/generation/meditations")
                            .with(csrf()).with(authentication(new UsernamePasswordAuthenticationToken(userId.toString(), null, List.of())))
                            .header("X-Composition-ID", compositionId.toString())
                            .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }
}
