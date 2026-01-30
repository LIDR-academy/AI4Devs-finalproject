package com.hexagonal.meditationbuilder.infrastructure.in.rest.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hexagonal.meditationbuilder.domain.enums.OutputType;
import com.hexagonal.meditationbuilder.domain.exception.CompositionNotFoundException;
import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.domain.model.MeditationComposition;
import com.hexagonal.meditationbuilder.domain.model.MusicReference;
import com.hexagonal.meditationbuilder.domain.model.TextContent;
import com.hexagonal.meditationbuilder.domain.ports.in.ComposeContentUseCase;
import com.hexagonal.meditationbuilder.domain.ports.in.GenerateImageUseCase;
import com.hexagonal.meditationbuilder.domain.ports.in.GenerateTextUseCase;
import com.hexagonal.meditationbuilder.infrastructure.in.rest.dto.*;
import com.hexagonal.meditationbuilder.infrastructure.in.rest.mapper.CompositionDtoMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests using MockMvc.
 * 
 * Tests HTTP layer: request validation, response mapping, status codes.
 * Use cases are mocked - no business logic tested here.
 */
@WebMvcTest(MeditationBuilderController.class)
@Import({CompositionDtoMapper.class, GlobalExceptionHandler.class})
@DisplayName("MeditationBuilderController Tests")
class MeditationBuilderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ComposeContentUseCase composeContentUseCase;

    @MockBean
    private GenerateTextUseCase generateTextUseCase;

    @MockBean
    private GenerateImageUseCase generateImageUseCase;

    private UUID compositionId;
    private MeditationComposition sampleComposition;
    private Clock fixedClock;

    @BeforeEach
    void setUp() {
        fixedClock = Clock.fixed(Instant.parse("2024-01-15T10:00:00Z"), ZoneId.of("UTC"));
        compositionId = UUID.randomUUID();
        sampleComposition = MeditationComposition.create(
                compositionId, 
                new TextContent("Sample meditation text"), 
                fixedClock
        );
    }

    @Nested
    @DisplayName("POST /v1/compositions")
    class CreateCompositionTests {

        @Test
        @DisplayName("should create composition and return 201")
        void shouldCreateCompositionAndReturn201() throws Exception {
            CreateCompositionRequest request = new CreateCompositionRequest("Meditation text");
            when(composeContentUseCase.createComposition(any())).thenReturn(sampleComposition);

            mockMvc.perform(post("/v1/compositions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(compositionId.toString()))
                    .andExpect(jsonPath("$.textContent").value("Sample meditation text"))
                    .andExpect(jsonPath("$.outputType").value("PODCAST"));
        }

        @Test
        @DisplayName("should return 400 when text is blank")
        void shouldReturn400WhenTextIsBlank() throws Exception {
            CreateCompositionRequest request = new CreateCompositionRequest("   ");

            mockMvc.perform(post("/v1/compositions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("should return 400 when text exceeds max length")
        void shouldReturn400WhenTextExceedsMaxLength() throws Exception {
            String longText = "a".repeat(10001);
            CreateCompositionRequest request = new CreateCompositionRequest(longText);

            mockMvc.perform(post("/v1/compositions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("PUT /v1/compositions/{id}/text")
    class UpdateTextTests {

        @Test
        @DisplayName("should update text and return 200")
        void shouldUpdateTextAndReturn200() throws Exception {
            UpdateTextRequest request = new UpdateTextRequest("Updated text");
            when(composeContentUseCase.updateText(eq(compositionId), any())).thenReturn(sampleComposition);

            mockMvc.perform(put("/v1/compositions/{id}/text", compositionId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(compositionId.toString()));
        }

        @Test
        @DisplayName("should return 404 when composition not found")
        void shouldReturn404WhenCompositionNotFound() throws Exception {
            UpdateTextRequest request = new UpdateTextRequest("Text");
            when(composeContentUseCase.updateText(eq(compositionId), any()))
                    .thenThrow(new CompositionNotFoundException(compositionId));

            mockMvc.perform(put("/v1/compositions/{id}/text", compositionId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error").value("NOT_FOUND"));
        }
    }

    @Nested
    @DisplayName("POST /v1/compositions/{id}/text/generate")
    class GenerateTextTests {

        @Test
        @DisplayName("should generate text from context")
        void shouldGenerateTextFromContext() throws Exception {
            GenerateTextRequest request = new GenerateTextRequest(null, "relaxation keywords");
            when(composeContentUseCase.getComposition(compositionId)).thenReturn(sampleComposition);
            when(generateTextUseCase.generateText(any())).thenReturn(new TextContent("Generated text"));

            mockMvc.perform(post("/v1/compositions/{id}/text/generate", compositionId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.text").value("Generated text"));
        }

        @Test
        @DisplayName("should enhance existing text")
        void shouldEnhanceExistingText() throws Exception {
            GenerateTextRequest request = new GenerateTextRequest("Existing text to enhance", null);
            when(composeContentUseCase.getComposition(compositionId)).thenReturn(sampleComposition);
            when(generateTextUseCase.enhanceText(any())).thenReturn(new TextContent("Enhanced text"));

            mockMvc.perform(post("/v1/compositions/{id}/text/generate", compositionId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.text").value("Enhanced text"));
        }

        @Test
        @DisplayName("should generate with default prompt when no request body")
        void shouldGenerateWithDefaultPromptWhenNoRequestBody() throws Exception {
            when(composeContentUseCase.getComposition(compositionId)).thenReturn(sampleComposition);
            when(generateTextUseCase.generateText(any())).thenReturn(new TextContent("Default generated"));

            mockMvc.perform(post("/v1/compositions/{id}/text/generate", compositionId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.text").value("Default generated"));
        }
    }

    @Nested
    @DisplayName("POST /v1/compositions/{id}/image/generate")
    class GenerateImageTests {

        @Test
        @DisplayName("should generate image and return 200")
        void shouldGenerateImageAndReturn200() throws Exception {
            when(composeContentUseCase.getComposition(compositionId)).thenReturn(sampleComposition);
            when(generateImageUseCase.generateImage(any()))
                    .thenReturn(new ImageReference("ai-generated-123"));

            mockMvc.perform(post("/v1/compositions/{id}/image/generate", compositionId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.imageReference").value("ai-generated-123"));
        }
    }

    @Nested
    @DisplayName("GET /v1/compositions/{id}/output-type")
    class GetOutputTypeTests {

        @Test
        @DisplayName("should return PODCAST when no image")
        void shouldReturnPodcastWhenNoImage() throws Exception {
            when(composeContentUseCase.getOutputType(compositionId)).thenReturn(OutputType.PODCAST);

            mockMvc.perform(get("/v1/compositions/{id}/output-type", compositionId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.outputType").value("PODCAST"));
        }

        @Test
        @DisplayName("should return VIDEO when has image")
        void shouldReturnVideoWhenHasImage() throws Exception {
            when(composeContentUseCase.getOutputType(compositionId)).thenReturn(OutputType.VIDEO);

            mockMvc.perform(get("/v1/compositions/{id}/output-type", compositionId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.outputType").value("VIDEO"));
        }
    }

    @Nested
    @DisplayName("Music Operations")
    class MusicOperationsTests {

        @Test
        @DisplayName("should select music and return 200")
        void shouldSelectMusicAndReturn200() throws Exception {
            SelectMusicRequest request = new SelectMusicRequest("calm-ocean");
            MeditationComposition withMusic = MeditationComposition
                    .create(compositionId, new TextContent("Text"), fixedClock)
                    .withMusic(new MusicReference("calm-ocean"), fixedClock);
            when(composeContentUseCase.selectMusic(eq(compositionId), any())).thenReturn(withMusic);

            mockMvc.perform(put("/v1/compositions/{id}/music", compositionId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.musicReference").value("calm-ocean"));
        }

        @Test
        @DisplayName("should preview music when selected")
        void shouldPreviewMusicWhenSelected() throws Exception {
            MeditationComposition withMusic = MeditationComposition
                    .create(compositionId, new TextContent("Text"), fixedClock)
                    .withMusic(new MusicReference("calm-ocean"), fixedClock);
            when(composeContentUseCase.getComposition(compositionId)).thenReturn(withMusic);

            mockMvc.perform(get("/v1/compositions/{id}/preview/music", compositionId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.musicReference").value("calm-ocean"))
                    .andExpect(jsonPath("$.previewUrl").exists());
        }

        @Test
        @DisplayName("should return 400 when no music selected for preview")
        void shouldReturn400WhenNoMusicSelectedForPreview() throws Exception {
            when(composeContentUseCase.getComposition(compositionId)).thenReturn(sampleComposition);

            mockMvc.perform(get("/v1/compositions/{id}/preview/music", compositionId))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Image Operations")
    class ImageOperationsTests {

        @Test
        @DisplayName("should set image and return 200")
        void shouldSetImageAndReturn200() throws Exception {
            SetImageRequest request = new SetImageRequest("sunset-beach");
            MeditationComposition withImage = MeditationComposition
                    .create(compositionId, new TextContent("Text"), fixedClock)
                    .withImage(new ImageReference("sunset-beach"), fixedClock);
            when(composeContentUseCase.setImage(eq(compositionId), any())).thenReturn(withImage);

            mockMvc.perform(put("/v1/compositions/{id}/image", compositionId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.imageReference").value("sunset-beach"))
                    .andExpect(jsonPath("$.outputType").value("VIDEO"));
        }

        @Test
        @DisplayName("should remove image and return 200")
        void shouldRemoveImageAndReturn200() throws Exception {
            when(composeContentUseCase.removeImage(compositionId)).thenReturn(sampleComposition);

            mockMvc.perform(delete("/v1/compositions/{id}/image", compositionId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.imageReference").isEmpty())
                    .andExpect(jsonPath("$.outputType").value("PODCAST"));
        }

        @Test
        @DisplayName("should preview image when selected")
        void shouldPreviewImageWhenSelected() throws Exception {
            MeditationComposition withImage = MeditationComposition
                    .create(compositionId, new TextContent("Text"), fixedClock)
                    .withImage(new ImageReference("sunset-beach"), fixedClock);
            when(composeContentUseCase.getComposition(compositionId)).thenReturn(withImage);

            mockMvc.perform(get("/v1/compositions/{id}/preview/image", compositionId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.imageReference").value("sunset-beach"))
                    .andExpect(jsonPath("$.previewUrl").exists());
        }

        @Test
        @DisplayName("should return 400 when no image selected for preview")
        void shouldReturn400WhenNoImageSelectedForPreview() throws Exception {
            when(composeContentUseCase.getComposition(compositionId)).thenReturn(sampleComposition);

            mockMvc.perform(get("/v1/compositions/{id}/preview/image", compositionId))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /v1/compositions/{id}")
    class GetCompositionTests {

        @Test
        @DisplayName("should return composition details")
        void shouldReturnCompositionDetails() throws Exception {
            when(composeContentUseCase.getComposition(compositionId)).thenReturn(sampleComposition);

            mockMvc.perform(get("/v1/compositions/{id}", compositionId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(compositionId.toString()))
                    .andExpect(jsonPath("$.textContent").value("Sample meditation text"));
        }
    }
}
