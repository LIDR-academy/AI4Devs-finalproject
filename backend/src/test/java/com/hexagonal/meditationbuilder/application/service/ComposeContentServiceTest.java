package com.hexagonal.meditationbuilder.application.service;

import com.hexagonal.meditationbuilder.domain.exception.CompositionNotFoundException;
import com.hexagonal.meditationbuilder.domain.exception.MusicNotFoundException;
import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.domain.model.MeditationComposition;
import com.hexagonal.meditationbuilder.domain.model.MusicReference;
import com.hexagonal.meditationbuilder.domain.model.TextContent;
import com.hexagonal.meditationbuilder.domain.ports.out.CompositionRepositoryPort;
import com.hexagonal.meditationbuilder.domain.ports.out.MediaCatalogPort;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for ComposeContentService.
 * 
 * Tests the application service that orchestrates composition operations.
 * Uses mocked ports to isolate the service logic.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ComposeContentService")
class ComposeContentServiceTest {

    private static final Instant FIXED_TIME = Instant.parse("2024-01-15T10:00:00Z");
    private static final Clock FIXED_CLOCK = Clock.fixed(FIXED_TIME, ZoneOffset.UTC);

    @Mock
    private MediaCatalogPort mediaCatalogPort;

    @Mock
    private CompositionRepositoryPort compositionRepositoryPort;

    private MeterRegistry meterRegistry;
    private ComposeContentService service;

    @BeforeEach
    void setUp() {
        meterRegistry = new SimpleMeterRegistry();
        service = new ComposeContentService(mediaCatalogPort, compositionRepositoryPort, FIXED_CLOCK, meterRegistry);
    }

    @Nested
    @DisplayName("createComposition()")
    class CreateCompositionTests {

        @Test
        @DisplayName("should create composition with text content")
        void shouldCreateCompositionWithTextContent() {
            TextContent text = new TextContent("Meditation text");
            when(compositionRepositoryPort.save(any())).thenAnswer(inv -> inv.getArgument(0));
            
            MeditationComposition result = service.createComposition(text);
            
            assertThat(result).isNotNull();
            assertThat(result.textContent()).isEqualTo(text);
            assertThat(result.id()).isNotNull();
            assertThat(result.createdAt()).isEqualTo(FIXED_TIME);
            assertThat(result.musicReference()).isNull();
            assertThat(result.imageReference()).isNull();
            verify(compositionRepositoryPort).save(any(MeditationComposition.class));
        }

        @Test
        @DisplayName("should throw exception when text is null")
        void shouldThrowExceptionWhenTextIsNull() {
            assertThatThrownBy(() -> service.createComposition(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("text");
        }
    }

    @Nested
    @DisplayName("updateText()")
    class UpdateTextTests {

        @Test
        @DisplayName("should update text of existing composition")
        void shouldUpdateTextOfExistingComposition() {
            UUID compositionId = UUID.randomUUID();
            TextContent originalText = new TextContent("Original text");
            TextContent newText = new TextContent("Updated text");
            MeditationComposition existing = MeditationComposition.create(compositionId, originalText, FIXED_CLOCK);
            
            when(compositionRepositoryPort.findById(compositionId)).thenReturn(java.util.Optional.of(existing));
            when(compositionRepositoryPort.save(any())).thenAnswer(inv -> inv.getArgument(0));
            
            MeditationComposition result = service.updateText(compositionId, newText);
            
            assertThat(result.textContent()).isEqualTo(newText);
            assertThat(result.id()).isEqualTo(compositionId);
            verify(compositionRepositoryPort).save(any(MeditationComposition.class));
        }

        @Test
        @DisplayName("should throw exception when composition not found")
        void shouldThrowExceptionWhenCompositionNotFound() {
            UUID compositionId = UUID.randomUUID();
            TextContent newText = new TextContent("New text");
            
            when(compositionRepositoryPort.findById(compositionId)).thenReturn(java.util.Optional.empty());
            
            assertThatThrownBy(() -> service.updateText(compositionId, newText))
                .isInstanceOf(CompositionNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("selectMusic()")
    class SelectMusicTests {

        @Test
        @DisplayName("should select music when it exists in catalog")
        void shouldSelectMusicWhenItExistsInCatalog() {
            UUID compositionId = UUID.randomUUID();
            TextContent text = new TextContent("Text");
            MusicReference music = new MusicReference("music-001");
            MeditationComposition existing = MeditationComposition.create(compositionId, text, FIXED_CLOCK);
            
            when(compositionRepositoryPort.findById(compositionId)).thenReturn(java.util.Optional.of(existing));
            when(mediaCatalogPort.musicExists(music)).thenReturn(true);
            when(compositionRepositoryPort.save(any())).thenAnswer(inv -> inv.getArgument(0));
            
            MeditationComposition result = service.selectMusic(compositionId, music);
            
            assertThat(result.musicReference()).isEqualTo(music);
            verify(mediaCatalogPort).musicExists(music);
        }

        @Test
        @DisplayName("should throw exception when music not in catalog")
        void shouldThrowExceptionWhenMusicNotInCatalog() {
            UUID compositionId = UUID.randomUUID();
            TextContent text = new TextContent("Text");
            MusicReference music = new MusicReference("invalid-music");
            MeditationComposition existing = MeditationComposition.create(compositionId, text, FIXED_CLOCK);
            
            when(compositionRepositoryPort.findById(compositionId)).thenReturn(java.util.Optional.of(existing));
            when(mediaCatalogPort.musicExists(music)).thenReturn(false);
            
            assertThatThrownBy(() -> service.selectMusic(compositionId, music))
                .isInstanceOf(MusicNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("setImage()")
    class SetImageTests {

        @Test
        @DisplayName("should set image on composition")
        void shouldSetImageOnComposition() {
            UUID compositionId = UUID.randomUUID();
            TextContent text = new TextContent("Text");
            ImageReference image = new ImageReference("image-001");
            MeditationComposition existing = MeditationComposition.create(compositionId, text, FIXED_CLOCK);
            
            when(compositionRepositoryPort.findById(compositionId)).thenReturn(java.util.Optional.of(existing));
            when(compositionRepositoryPort.save(any())).thenAnswer(inv -> inv.getArgument(0));
            
            MeditationComposition result = service.setImage(compositionId, image);
            
            assertThat(result.imageReference()).isEqualTo(image);
            assertThat(result.outputType()).isEqualTo(com.hexagonal.meditationbuilder.domain.enums.OutputType.VIDEO);
        }
    }

    @Nested
    @DisplayName("removeImage()")
    class RemoveImageTests {

        @Test
        @DisplayName("should remove image from composition")
        void shouldRemoveImageFromComposition() {
            UUID compositionId = UUID.randomUUID();
            TextContent text = new TextContent("Text");
            ImageReference image = new ImageReference("image-001");
            MeditationComposition existing = MeditationComposition.create(compositionId, text, FIXED_CLOCK)
                .withImage(image, FIXED_CLOCK);
            
            when(compositionRepositoryPort.findById(compositionId)).thenReturn(java.util.Optional.of(existing));
            when(compositionRepositoryPort.save(any())).thenAnswer(inv -> inv.getArgument(0));
            
            MeditationComposition result = service.removeImage(compositionId);
            
            assertThat(result.imageReference()).isNull();
            assertThat(result.outputType()).isEqualTo(com.hexagonal.meditationbuilder.domain.enums.OutputType.PODCAST);
        }
    }

    @Nested
    @DisplayName("getComposition()")
    class GetCompositionTests {

        @Test
        @DisplayName("should return composition when found")
        void shouldReturnCompositionWhenFound() {
            UUID compositionId = UUID.randomUUID();
            TextContent text = new TextContent("Text");
            MeditationComposition existing = MeditationComposition.create(compositionId, text, FIXED_CLOCK);
            
            when(compositionRepositoryPort.findById(compositionId)).thenReturn(java.util.Optional.of(existing));
            
            MeditationComposition result = service.getComposition(compositionId);
            
            assertThat(result).isEqualTo(existing);
        }

        @Test
        @DisplayName("should throw exception when not found")
        void shouldThrowExceptionWhenNotFound() {
            UUID compositionId = UUID.randomUUID();
            
            when(compositionRepositoryPort.findById(compositionId)).thenReturn(java.util.Optional.empty());
            
            assertThatThrownBy(() -> service.getComposition(compositionId))
                .isInstanceOf(CompositionNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("getOutputType()")
    class GetOutputTypeTests {

        @Test
        @DisplayName("should return PODCAST when no image")
        void shouldReturnPodcastWhenNoImage() {
            UUID compositionId = UUID.randomUUID();
            TextContent text = new TextContent("Text");
            MeditationComposition existing = MeditationComposition.create(compositionId, text, FIXED_CLOCK);
            
            when(compositionRepositoryPort.findById(compositionId)).thenReturn(java.util.Optional.of(existing));
            
            var result = service.getOutputType(compositionId);
            
            assertThat(result).isEqualTo(com.hexagonal.meditationbuilder.domain.enums.OutputType.PODCAST);
        }

        @Test
        @DisplayName("should return VIDEO when has image")
        void shouldReturnVideoWhenHasImage() {
            UUID compositionId = UUID.randomUUID();
            TextContent text = new TextContent("Text");
            ImageReference image = new ImageReference("image-001");
            MeditationComposition existing = MeditationComposition.create(compositionId, text, FIXED_CLOCK)
                .withImage(image, FIXED_CLOCK);
            
            when(compositionRepositoryPort.findById(compositionId)).thenReturn(java.util.Optional.of(existing));
            
            var result = service.getOutputType(compositionId);
            
            assertThat(result).isEqualTo(com.hexagonal.meditationbuilder.domain.enums.OutputType.VIDEO);
        }
    }
}
