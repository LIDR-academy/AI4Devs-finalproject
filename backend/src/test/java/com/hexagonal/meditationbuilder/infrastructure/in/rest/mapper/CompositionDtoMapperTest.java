package com.hexagonal.meditationbuilder.infrastructure.in.rest.mapper;

import com.hexagonal.meditationbuilder.domain.enums.OutputType;
import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.domain.model.MeditationComposition;
import com.hexagonal.meditationbuilder.domain.model.MusicReference;
import com.hexagonal.meditationbuilder.domain.model.TextContent;
import com.hexagonal.meditationbuilder.infrastructure.in.rest.dto.*;
import org.junit.jupiter.api.*;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for CompositionDtoMapper.
 * 
 * Tests bidirectional mapping between domain models and REST DTOs.
 */
@DisplayName("CompositionDtoMapper Tests")
class CompositionDtoMapperTest {

    private CompositionDtoMapper mapper;
    private Clock fixedClock;

    @BeforeEach
    void setUp() {
        mapper = new CompositionDtoMapper();
        fixedClock = Clock.fixed(Instant.parse("2024-01-15T10:00:00Z"), ZoneId.of("UTC"));
    }

    // Helper to create composition with all fields
    private MeditationComposition createFullComposition(UUID id, TextContent text, 
            MusicReference music, ImageReference image) {
        return MeditationComposition.create(id, text, fixedClock)
                .withMusic(music, fixedClock)
                .withImage(image, fixedClock);
    }

    // Helper to create composition without optional fields
    private MeditationComposition createSimpleComposition(UUID id, TextContent text) {
        return MeditationComposition.create(id, text, fixedClock);
    }

    @Nested
    @DisplayName("toCompositionResponse()")
    class ToCompositionResponseTests {

        @Test
        @DisplayName("should map full composition to response")
        void shouldMapFullCompositionToResponse() {
            // Given
            UUID id = UUID.randomUUID();
            TextContent text = new TextContent("Meditation text");
            MusicReference music = new MusicReference("calm-waves");
            ImageReference image = new ImageReference("sunset-beach");
            MeditationComposition composition = createFullComposition(id, text, music, image);

            // When
            CompositionResponse response = mapper.toCompositionResponse(composition);

            // Then
            assertThat(response.id()).isEqualTo(id);
            assertThat(response.textContent()).isEqualTo("Meditation text");
            assertThat(response.musicReference()).isEqualTo("calm-waves");
            assertThat(response.imageReference()).isEqualTo("sunset-beach");
            assertThat(response.outputType()).isEqualTo("VIDEO");
            assertThat(response.createdAt()).isNotNull();
            assertThat(response.updatedAt()).isNotNull();
        }

        @Test
        @DisplayName("should map composition without optional fields")
        void shouldMapCompositionWithoutOptionalFields() {
            // Given
            UUID id = UUID.randomUUID();
            TextContent text = new TextContent("Simple text");
            MeditationComposition composition = createSimpleComposition(id, text);

            // When
            CompositionResponse response = mapper.toCompositionResponse(composition);

            // Then
            assertThat(response.id()).isEqualTo(id);
            assertThat(response.textContent()).isEqualTo("Simple text");
            assertThat(response.musicReference()).isNull();
            assertThat(response.imageReference()).isNull();
            assertThat(response.outputType()).isEqualTo("PODCAST");
        }

        @Test
        @DisplayName("should throw when composition is null")
        void shouldThrowWhenCompositionIsNull() {
            assertThatThrownBy(() -> mapper.toCompositionResponse(null))
                    .isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("composition must not be null");
        }
    }

    @Nested
    @DisplayName("toTextContentResponse()")
    class ToTextContentResponseTests {

        @Test
        @DisplayName("should map text content to response")
        void shouldMapTextContentToResponse() {
            TextContent textContent = new TextContent("Generated meditation text");

            TextContentResponse response = mapper.toTextContentResponse(textContent);

            assertThat(response.text()).isEqualTo("Generated meditation text");
        }

        @Test
        @DisplayName("should throw when text content is null")
        void shouldThrowWhenTextContentIsNull() {
            assertThatThrownBy(() -> mapper.toTextContentResponse(null))
                    .isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("textContent must not be null");
        }
    }

    @Nested
    @DisplayName("toImageReferenceResponse()")
    class ToImageReferenceResponseTests {

        @Test
        @DisplayName("should map image reference to response")
        void shouldMapImageReferenceToResponse() {
            ImageReference imageRef = new ImageReference("ai-generated-sunset-12345");

            ImageReferenceResponse response = mapper.toImageReferenceResponse(imageRef);

            assertThat(response.imageReference()).isEqualTo("ai-generated-sunset-12345");
        }

        @Test
        @DisplayName("should throw when image reference is null")
        void shouldThrowWhenImageReferenceIsNull() {
            assertThatThrownBy(() -> mapper.toImageReferenceResponse(null))
                    .isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("imageReference must not be null");
        }
    }

    @Nested
    @DisplayName("toOutputTypeResponse()")
    class ToOutputTypeResponseTests {

        @Test
        @DisplayName("should map PODCAST output type")
        void shouldMapPodcastOutputType() {
            OutputTypeResponse response = mapper.toOutputTypeResponse(OutputType.PODCAST);

            assertThat(response.outputType()).isEqualTo("PODCAST");
        }

        @Test
        @DisplayName("should map VIDEO output type")
        void shouldMapVideoOutputType() {
            OutputTypeResponse response = mapper.toOutputTypeResponse(OutputType.VIDEO);

            assertThat(response.outputType()).isEqualTo("VIDEO");
        }

        @Test
        @DisplayName("should throw when output type is null")
        void shouldThrowWhenOutputTypeIsNull() {
            assertThatThrownBy(() -> mapper.toOutputTypeResponse(null))
                    .isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("outputType must not be null");
        }
    }

    @Nested
    @DisplayName("toMusicPreviewResponse()")
    class ToMusicPreviewResponseTests {

        @Test
        @DisplayName("should create music preview response")
        void shouldCreateMusicPreviewResponse() {
            UUID id = UUID.randomUUID();
            MeditationComposition composition = MeditationComposition
                    .create(id, new TextContent("Text"), fixedClock)
                    .withMusic(new MusicReference("calm-ocean"), fixedClock);

            MusicPreviewResponse response = mapper.toMusicPreviewResponse(
                    composition, 
                    "http://media.example.com/preview"
            );

            assertThat(response.musicReference()).isEqualTo("calm-ocean");
            assertThat(response.previewUrl()).isEqualTo("http://media.example.com/preview/music/calm-ocean");
        }

        @Test
        @DisplayName("should throw when no music selected")
        void shouldThrowWhenNoMusicSelected() {
            UUID id = UUID.randomUUID();
            MeditationComposition composition = createSimpleComposition(id, new TextContent("Text"));

            assertThatThrownBy(() -> mapper.toMusicPreviewResponse(composition, "http://base"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("No music selected");
        }
    }

    @Nested
    @DisplayName("toImagePreviewResponse()")
    class ToImagePreviewResponseTests {

        @Test
        @DisplayName("should create image preview response")
        void shouldCreateImagePreviewResponse() {
            UUID id = UUID.randomUUID();
            MeditationComposition composition = MeditationComposition
                    .create(id, new TextContent("Text"), fixedClock)
                    .withImage(new ImageReference("sunset-beach"), fixedClock);

            ImagePreviewResponse response = mapper.toImagePreviewResponse(
                    composition, 
                    "http://media.example.com/preview"
            );

            assertThat(response.imageReference()).isEqualTo("sunset-beach");
            assertThat(response.previewUrl()).isEqualTo("http://media.example.com/preview/images/sunset-beach");
        }

        @Test
        @DisplayName("should throw when no image selected")
        void shouldThrowWhenNoImageSelected() {
            UUID id = UUID.randomUUID();
            MeditationComposition composition = createSimpleComposition(id, new TextContent("Text"));

            assertThatThrownBy(() -> mapper.toImagePreviewResponse(composition, "http://base"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("No image selected");
        }
    }

    @Nested
    @DisplayName("Request DTO → Domain Mappings")
    class RequestToDomainTests {

        @Test
        @DisplayName("should map text string to TextContent")
        void shouldMapTextStringToTextContent() {
            TextContent result = mapper.toTextContent("Meditation text content");

            assertThat(result.value()).isEqualTo("Meditation text content");
        }

        @Test
        @DisplayName("should map music reference string to MusicReference")
        void shouldMapMusicReferenceStringToMusicReference() {
            MusicReference result = mapper.toMusicReference("calm-ocean-waves");

            assertThat(result.value()).isEqualTo("calm-ocean-waves");
        }

        @Test
        @DisplayName("should map image reference string to ImageReference")
        void shouldMapImageReferenceStringToImageReference() {
            ImageReference result = mapper.toImageReference("sunset-beach-001");

            assertThat(result.value()).isEqualTo("sunset-beach-001");
        }

        @Test
        @DisplayName("should throw when text is null")
        void shouldThrowWhenTextIsNull() {
            assertThatThrownBy(() -> mapper.toTextContent(null))
                    .isInstanceOf(NullPointerException.class);
        }

        @Test
        @DisplayName("should throw when music reference is null")
        void shouldThrowWhenMusicReferenceIsNull() {
            assertThatThrownBy(() -> mapper.toMusicReference(null))
                    .isInstanceOf(NullPointerException.class);
        }

        @Test
        @DisplayName("should throw when image reference is null")
        void shouldThrowWhenImageReferenceIsNull() {
            assertThatThrownBy(() -> mapper.toImageReference(null))
                    .isInstanceOf(NullPointerException.class);
        }
    }
}
