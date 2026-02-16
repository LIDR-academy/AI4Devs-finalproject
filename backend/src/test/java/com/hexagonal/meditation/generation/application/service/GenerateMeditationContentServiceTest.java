package com.hexagonal.meditation.generation.application.service;

import com.hexagonal.meditation.generation.application.validator.TextLengthEstimator;
import com.hexagonal.meditation.generation.domain.enums.GenerationStatus;
import com.hexagonal.meditation.generation.domain.enums.MediaType;
import com.hexagonal.meditation.generation.domain.exception.GenerationTimeoutException;
import com.hexagonal.meditation.generation.domain.exception.InvalidContentException;
import com.hexagonal.meditation.generation.domain.model.*;
import com.hexagonal.meditation.generation.domain.ports.in.GenerateMeditationContentUseCase;
import com.hexagonal.meditation.generation.domain.ports.out.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GenerateMeditationContentService Tests")
class GenerateMeditationContentServiceTest {
    
    @Mock private TextLengthEstimator textLengthEstimator;
    @Mock private IdempotencyKeyGenerator idempotencyKeyGenerator;
    @Mock private VoiceSynthesisPort voiceSynthesisPort;
    @Mock private SubtitleSyncPort subtitleSyncPort;
    @Mock private AudioRenderingPort audioRenderingPort;
    @Mock private VideoRenderingPort videoRenderingPort;
    @Mock private MediaStoragePort mediaStoragePort;
    @Mock private ContentRepositoryPort contentRepositoryPort;
    @Mock private com.hexagonal.meditation.generation.infrastructure.out.service.audio.AudioMetadataService audioMetadataService;
    
    private Clock clock;
    private GenerateMeditationContentService service;

    @BeforeEach
    void setUp() {
        clock = Clock.fixed(Instant.parse("2024-01-15T10:00:00Z"), ZoneId.of("UTC"));
        service = new GenerateMeditationContentService(
            textLengthEstimator,
            idempotencyKeyGenerator,
            voiceSynthesisPort,
            subtitleSyncPort,
            audioRenderingPort,
            videoRenderingPort,
            mediaStoragePort,
            contentRepositoryPort,
            audioMetadataService,
            clock
        );
    }
    
    @Test
    @DisplayName("Should generate audio meditation successfully")
    void shouldGenerateAudioMeditation() {
        // Arrange
        UUID compositionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String text = "Breathe deeply and relax. Feel the calm wash over you.";
        String music = "calm-ocean.mp3";
        String idempotencyKey = "test-key-123";
        
        GenerateMeditationContentUseCase.GenerationRequest request = 
            new GenerateMeditationContentUseCase.GenerationRequest(
                compositionId, userId, text, music, null
            );
        
        when(textLengthEstimator.validateAndEstimate(text)).thenReturn(60);
        when(idempotencyKeyGenerator.generate(userId, text, music, null)).thenReturn(idempotencyKey);
        when(contentRepositoryPort.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.empty());
        when(contentRepositoryPort.save(any(GeneratedMeditationContent.class))).thenAnswer(inv -> inv.getArgument(0));
        
        // Act
        GenerateMeditationContentUseCase.GenerationResponse response = service.generate(request);
        
        // Assert
        assertThat(response).isNotNull();
        assertThat(response.compositionId()).isEqualTo(compositionId);
        assertThat(response.userId()).isEqualTo(userId);
        assertThat(response.status()).isEqualTo(GenerationStatus.PROCESSING);
        assertThat(response.mediaType()).isEqualTo(MediaType.AUDIO);
        assertThat(response.mediaUrl()).isEmpty();
        assertThat(response.subtitleUrl()).isEmpty();
        
        verify(textLengthEstimator).validateAndEstimate(text);
        verify(idempotencyKeyGenerator).generate(userId, text, music, null);
        verify(contentRepositoryPort).findByIdempotencyKey(idempotencyKey);
        verify(contentRepositoryPort).save(any(GeneratedMeditationContent.class));
    }
    
    @Test
    @DisplayName("Should generate video meditation successfully")
    void shouldGenerateVideoMeditation() {
        // Arrange
        UUID compositionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String text = "Breathe deeply and relax. Feel the calm wash over you.";
        String music = "calm-ocean.mp3";
        String image = "sunset-beach.jpg";
        String idempotencyKey = "test-key-456";
        
        GenerateMeditationContentUseCase.GenerationRequest request = 
            new GenerateMeditationContentUseCase.GenerationRequest(
                compositionId, userId, text, music, image
            );
        
        when(textLengthEstimator.validateAndEstimate(text)).thenReturn(90);
        when(idempotencyKeyGenerator.generate(userId, text, music, image)).thenReturn(idempotencyKey);
        when(contentRepositoryPort.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.empty());
        when(contentRepositoryPort.save(any(GeneratedMeditationContent.class))).thenAnswer(inv -> inv.getArgument(0));
        
        // Act
        GenerateMeditationContentUseCase.GenerationResponse response = service.generate(request);
        
        // Assert
        assertThat(response).isNotNull();
        assertThat(response.compositionId()).isEqualTo(compositionId);
        assertThat(response.userId()).isEqualTo(userId);
        assertThat(response.status()).isEqualTo(GenerationStatus.PROCESSING);
        assertThat(response.mediaType()).isEqualTo(MediaType.VIDEO);
        assertThat(response.mediaUrl()).isEmpty();
        assertThat(response.subtitleUrl()).isEmpty();
        
        verify(textLengthEstimator).validateAndEstimate(text);
        verify(idempotencyKeyGenerator).generate(userId, text, music, image);
        verify(contentRepositoryPort).findByIdempotencyKey(idempotencyKey);
        verify(contentRepositoryPort).save(any(GeneratedMeditationContent.class));
    }
    
    @Test
    @DisplayName("Should return existing result when idempotency key matches")
    void shouldReturnExistingResultForIdempotentRequest() {
        // Arrange
        UUID compositionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID existingId = UUID.randomUUID();
        String text = "Breathe deeply and relax.";
        String music = "calm-ocean.mp3";
        String idempotencyKey = "existing-key-789";
        
        GenerateMeditationContentUseCase.GenerationRequest request = 
            new GenerateMeditationContentUseCase.GenerationRequest(
                compositionId, userId, text, music, null
            );
        
        GeneratedMeditationContent existingOutput = GeneratedMeditationContent.createAudio(
            UUID.randomUUID(),
            compositionId,
            userId,
            idempotencyKey,
            new NarrationScript(text),
            clock
        );
        
        when(textLengthEstimator.validateAndEstimate(text)).thenReturn(60);
        when(idempotencyKeyGenerator.generate(userId, text, music, null)).thenReturn(idempotencyKey);
        when(contentRepositoryPort.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.of(existingOutput));
        
        // Act
        GenerateMeditationContentUseCase.GenerationResponse response = service.generate(request);
        
        // Assert
        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo(GenerationStatus.PROCESSING);
        
        verify(textLengthEstimator).validateAndEstimate(text);
        verify(idempotencyKeyGenerator).generate(userId, text, music, null);
        verify(contentRepositoryPort).findByIdempotencyKey(idempotencyKey);
        verify(contentRepositoryPort, never()).save(any());
    }
    
    @Test
    @DisplayName("Should reject text that exceeds timeout threshold")
    void shouldRejectTextExceedingTimeout() {
        // Arrange
        UUID compositionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String text = "Very long meditation text...".repeat(100);
        String music = "calm-ocean.mp3";
        
        GenerateMeditationContentUseCase.GenerationRequest request = 
            new GenerateMeditationContentUseCase.GenerationRequest(
                compositionId, userId, text, music, null
            );
        
        when(textLengthEstimator.validateAndEstimate(text)).thenReturn(300); // 5 minutes > 3 minute max
        
        // Act & Assert
        assertThatThrownBy(() -> service.generate(request))
            .isInstanceOf(GenerationTimeoutException.class)
            .hasMessageContaining("300")
            .hasMessageContaining("180");
        
        verify(textLengthEstimator).validateAndEstimate(text);
        verify(contentRepositoryPort, never()).save(any());
    }
    
    @Test
    @DisplayName("Should reject text that is too short")
    void shouldRejectTooShortText() {
        // Arrange
        UUID compositionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String text = "Too short";
        String music = "calm-ocean.mp3";
        
        GenerateMeditationContentUseCase.GenerationRequest request = 
            new GenerateMeditationContentUseCase.GenerationRequest(
                compositionId, userId, text, music, null
            );
        
        when(textLengthEstimator.validateAndEstimate(text))
            .thenThrow(new InvalidContentException("Text too short", "narrationText"));
        
        // Act & Assert
        assertThatThrownBy(() -> service.generate(request))
            .isInstanceOf(InvalidContentException.class)
            .hasMessageContaining("Text too short");
        
        verify(textLengthEstimator).validateAndEstimate(text);
        verify(contentRepositoryPort, never()).save(any());
    }
    
    @Test
    @DisplayName("Should reject video request without image reference")
    void shouldRejectVideoRequestWithoutImage() {
        // Arrange
        UUID compositionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String text = "Breathe deeply and relax. Feel the calm wash over you.";
        String music = "calm-ocean.mp3";
        String idempotencyKey = "test-key";
        
        // Image is blank - should trigger VIDEO type but fail validation
        GenerateMeditationContentUseCase.GenerationRequest request = 
            new GenerateMeditationContentUseCase.GenerationRequest(
                compositionId, userId, text, music, ""
            );
        
        when(textLengthEstimator.validateAndEstimate(text)).thenReturn(60);
        when(idempotencyKeyGenerator.generate(userId, text, music, "")).thenReturn(idempotencyKey);
        when(contentRepositoryPort.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThatThrownBy(() -> service.generate(request))
            .isInstanceOf(InvalidContentException.class)
            .hasMessageContaining("Image reference required for video generation");
        
        verify(contentRepositoryPort, never()).save(any());
    }
    
    @Test
    @DisplayName("Should validate text before checking idempotency")
    void shouldValidateTextBeforeIdempotencyCheck() {
        // Arrange
        UUID compositionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String text = "Invalid";
        String music = "calm-ocean.mp3";
        
        GenerateMeditationContentUseCase.GenerationRequest request = 
            new GenerateMeditationContentUseCase.GenerationRequest(
                compositionId, userId, text, music, null
            );
        
        when(textLengthEstimator.validateAndEstimate(text))
            .thenThrow(new InvalidContentException("Text too short", "narrationText"));
        
        // Act & Assert
        assertThatThrownBy(() -> service.generate(request))
            .isInstanceOf(InvalidContentException.class);
        
        verify(textLengthEstimator).validateAndEstimate(text);
        verify(idempotencyKeyGenerator, never()).generate(any(), any(), any(), any());
        verify(contentRepositoryPort, never()).findByIdempotencyKey(any());
    }
    
    @Test
    @DisplayName("Should create domain aggregate with correct media type")
    void shouldCreateDomainAggregateWithCorrectMediaType() {
        // Arrange
        UUID compositionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String text = "Breathe deeply and relax. Feel the calm wash over you.";
        String music = "calm-ocean.mp3";
        String image = "sunset.jpg";
        String idempotencyKey = "test-key";
        
        GenerateMeditationContentUseCase.GenerationRequest request = 
            new GenerateMeditationContentUseCase.GenerationRequest(
                compositionId, userId, text, music, image
            );
        
        when(textLengthEstimator.validateAndEstimate(text)).thenReturn(60);
        when(idempotencyKeyGenerator.generate(userId, text, music, image)).thenReturn(idempotencyKey);
        when(contentRepositoryPort.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.empty());
        when(contentRepositoryPort.save(any(GeneratedMeditationContent.class))).thenAnswer(inv -> inv.getArgument(0));
        
        // Act
        service.generate(request);
        
        // Assert - verify save was called with correct aggregate
        verify(contentRepositoryPort).save(argThat(output -> 
            output.mediaType() == MediaType.VIDEO &&
            output.status() == GenerationStatus.PROCESSING &&
            output.compositionId().equals(compositionId) &&
            output.userId().equals(userId)
        ));
    }
    
    @Test
    @DisplayName("Should handle null image reference as audio request")
    void shouldHandleNullImageAsAudioRequest() {
        // Arrange
        UUID compositionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String text = "Breathe deeply and relax. Feel the calm wash over you.";
        String music = "calm-ocean.mp3";
        String idempotencyKey = "test-key";
        
        GenerateMeditationContentUseCase.GenerationRequest request = 
            new GenerateMeditationContentUseCase.GenerationRequest(
                compositionId, userId, text, music, null
            );
        
        when(textLengthEstimator.validateAndEstimate(text)).thenReturn(60);
        when(idempotencyKeyGenerator.generate(userId, text, music, null)).thenReturn(idempotencyKey);
        when(contentRepositoryPort.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.empty());
        when(contentRepositoryPort.save(any(GeneratedMeditationContent.class))).thenAnswer(inv -> inv.getArgument(0));
        
        // Act
        GenerateMeditationContentUseCase.GenerationResponse response = service.generate(request);
        
        // Assert
        assertThat(response.mediaType()).isEqualTo(MediaType.AUDIO);
        
        verify(contentRepositoryPort).save(argThat(output -> 
            output.mediaType() == MediaType.AUDIO &&
            output.backgroundImage().isEmpty()
        ));
    }
}
