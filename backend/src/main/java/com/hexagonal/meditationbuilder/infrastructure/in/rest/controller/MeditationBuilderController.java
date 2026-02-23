package com.hexagonal.meditationbuilder.infrastructure.in.rest.controller;

import com.hexagonal.meditationbuilder.domain.enums.OutputType;
import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.domain.model.MeditationComposition;
import com.hexagonal.meditationbuilder.domain.model.TextContent;
import com.hexagonal.meditationbuilder.domain.ports.in.ComposeContentUseCase;
import com.hexagonal.meditationbuilder.domain.ports.in.GenerateImageUseCase;
import com.hexagonal.meditationbuilder.domain.ports.in.GenerateTextUseCase;
import com.hexagonal.meditationbuilder.infrastructure.in.rest.dto.*;
import com.hexagonal.meditationbuilder.infrastructure.in.rest.mapper.CompositionDtoMapper;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller for Meditation Builder API.
 * 
 * Implements all 8 capabilities from OpenAPI specification:
 * 1. Access Meditation Builder (create composition)
 * 2. Define Meditation Text (update text)
 * 3. AI Text Generation/Enhancement
 * 4. AI Image Generation
 * 5. Determine Output Type - Podcast
 * 6. Determine Output Type - Video
 * 7. Preview Selected Music
 * 8. Preview Image
 * 
 * Architecture: Infrastructure In adapter, delegates to use cases.
 * No business logic - only HTTP concerns and DTO mapping.
 */
@RestController
@RequestMapping("/v1/compositions")
public class MeditationBuilderController {

    private static final Logger log = LoggerFactory.getLogger(MeditationBuilderController.class);

    private final ComposeContentUseCase composeContentUseCase;
    private final GenerateTextUseCase generateTextUseCase;
    private final GenerateImageUseCase generateImageUseCase;
    private final CompositionDtoMapper mapper;
    private final String mediaPreviewBaseUrl;

    public MeditationBuilderController(
            ComposeContentUseCase composeContentUseCase,
            GenerateTextUseCase generateTextUseCase,
            GenerateImageUseCase generateImageUseCase,
            CompositionDtoMapper mapper,
            @Value("${media.preview.base-url:http://localhost:8081/api/media/preview}") String mediaPreviewBaseUrl) {
        this.composeContentUseCase = composeContentUseCase;
        this.generateTextUseCase = generateTextUseCase;
        this.generateImageUseCase = generateImageUseCase;
        this.mapper = mapper;
        this.mediaPreviewBaseUrl = mediaPreviewBaseUrl;
    }

    // ========== Capability 1: Create Composition ==========

    /**
     * POST /compositions - Create new meditation composition.
     * 
     * Capability 1: Access Meditation Builder and initialize composition.
     * Scenario 1: "Access Meditation Builder and see text field"
     */
    @PostMapping
    public ResponseEntity<CompositionResponse> createComposition(
            @Valid @RequestBody CreateCompositionRequest request) {
        log.info("Creating new composition");
        
        TextContent textContent = mapper.toTextContent(request.text());
        MeditationComposition composition = composeContentUseCase.createComposition(textContent);
        
        log.info("Composition created: {}", composition.id());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mapper.toCompositionResponse(composition));
    }

    // ========== Capability 2: Update Text ==========

    /**
     * PUT /compositions/{compositionId}/text - Update meditation text.
     * 
     * Capability 2: Define Meditation Text.
     * Scenario 2: "Enter and preserve manual text"
     */
    @PutMapping("/{compositionId}/text")
    public ResponseEntity<CompositionResponse> updateText(
            @PathVariable UUID compositionId,
            @Valid @RequestBody UpdateTextRequest request) {
        log.info("Updating text for composition: {}", compositionId);
        
        TextContent newText = mapper.toTextContent(request.text());
        MeditationComposition updated = composeContentUseCase.updateText(compositionId, newText);
        
        return ResponseEntity.ok(mapper.toCompositionResponse(updated));
    }

    // ========== Capability 3: AI Text Generation ==========


    // ========== Capability 3 (global): AI Text Generation without composition ===========

    /**
     * POST /v1/compositions/text/generate - Generate or enhance meditation text with AI (no composition required).
     * Capability 3: AI Text Generation/Enhancement (global).
     * Scenario 3: "AI text generation and enhancement"
     */
    @PostMapping("/text/generate")
    public ResponseEntity<TextContentResponse> generateTextGlobal(
            @RequestBody(required = false) GenerateTextRequest request) {
        log.info("Generating/enhancing text (global, no composition)");

        TextContent result;
        if (request != null && request.existingText() != null && !request.existingText().isBlank()) {
            // Enhancement mode: enhance existing text
            TextContent existingText = mapper.toTextContent(request.existingText());
            result = generateTextUseCase.generateText(existingText.value());
        } else {
            // Generation mode: generate from scratch (use context if provided)
            String context = (request != null && request.context() != null) ? request.context() : "";
            result = generateTextUseCase.generateText(context);
        }

        return ResponseEntity.ok(mapper.toTextContentResponse(result));
    }

    // ========== Capability 4: AI Image Generation ==========

    /**
     * POST /v1/compositions/image/generate - Generate AI image from meditation text (global).
     * Capability 4: AI Image Generation (global).
     * Scenario 4: "Generate AI image from text"
     */
    @PostMapping("/image/generate")
    public ResponseEntity<ImageReferenceResponse> generateImageGlobal(
            @RequestBody String text) {
        log.info("Generating image (global) from text");
        ImageReference generated = generateImageUseCase.generateImage(text);
        return ResponseEntity.ok(mapper.toImageReferenceResponse(generated));
    }

    // ========== Capabilities 5 & 6: Output Type ==========

    /**
     * GET /compositions/{compositionId}/output-type - Get output type determination.
     * 
     * Capability 5: Determine Output Type - Podcast (no image)
     * Capability 6: Determine Output Type - Video (has image)
     * Scenarios 5 & 6: Output type determination
     */
    @GetMapping("/{compositionId}/output-type")
    public ResponseEntity<OutputTypeResponse> getOutputType(
            @PathVariable UUID compositionId) {
        log.debug("Getting output type for composition: {}", compositionId);
        
        OutputType outputType = composeContentUseCase.getOutputType(compositionId);
        
        return ResponseEntity.ok(mapper.toOutputTypeResponse(outputType));
    }

    // ========== Music Operations ==========

    /**
     * PUT /compositions/{compositionId}/music - Select music.
     */
    @PutMapping("/{compositionId}/music")
    public ResponseEntity<CompositionResponse> selectMusic(
            @PathVariable UUID compositionId,
            @Valid @RequestBody SelectMusicRequest request) {
        log.info("Selecting music for composition: {}", compositionId);
        
        MeditationComposition updated = composeContentUseCase.selectMusic(
                compositionId, 
                mapper.toMusicReference(request.musicReference())
        );
        
        return ResponseEntity.ok(mapper.toCompositionResponse(updated));
    }

    /**
     * GET /compositions/{compositionId}/preview/music - Preview music.
     * 
     * Capability 7: Preview Selected Music.
     * Scenario 7: "Preview music"
     */
    @GetMapping("/{compositionId}/preview/music")
    public ResponseEntity<MusicPreviewResponse> previewMusic(
            @PathVariable UUID compositionId) {
        log.debug("Previewing music for composition: {}", compositionId);
        
        MeditationComposition composition = composeContentUseCase.getComposition(compositionId);
        
        if (composition.musicReference() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(mapper.toMusicPreviewResponse(composition, mediaPreviewBaseUrl));
    }

    // ========== Image Operations ==========

    /**
     * PUT /compositions/{compositionId}/image - Set image.
     */
    @PutMapping("/{compositionId}/image")
    public ResponseEntity<CompositionResponse> setImage(
            @PathVariable UUID compositionId,
            @Valid @RequestBody SetImageRequest request) {
        log.info("Setting image for composition: {}", compositionId);
        
        MeditationComposition updated = composeContentUseCase.setImage(
                compositionId,
                mapper.toImageReference(request.imageReference())
        );
        
        return ResponseEntity.ok(mapper.toCompositionResponse(updated));
    }

    /**
     * DELETE /compositions/{compositionId}/image - Remove image.
     */
    @DeleteMapping("/{compositionId}/image")
    public ResponseEntity<CompositionResponse> removeImage(
            @PathVariable UUID compositionId) {
        log.info("Removing image from composition: {}", compositionId);
        
        MeditationComposition updated = composeContentUseCase.removeImage(compositionId);
        
        return ResponseEntity.ok(mapper.toCompositionResponse(updated));
    }

    /**
     * GET /compositions/{compositionId}/preview/image - Preview image.
     * 
     * Capability 8: Preview Image.
     * Scenario 8: "Preview image"
     */
    @GetMapping("/{compositionId}/preview/image")
    public ResponseEntity<ImagePreviewResponse> previewImage(
            @PathVariable UUID compositionId) {
        log.debug("Previewing image for composition: {}", compositionId);
        
        MeditationComposition composition = composeContentUseCase.getComposition(compositionId);
        
        if (composition.imageReference() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(mapper.toImagePreviewResponse(composition, mediaPreviewBaseUrl));
    }

    // ========== Get Composition ==========

    /**
     * GET /compositions/{compositionId} - Get composition details.
     */
    @GetMapping("/{compositionId}")
    public ResponseEntity<CompositionResponse> getComposition(
            @PathVariable UUID compositionId) {
        log.debug("Getting composition: {}", compositionId);
        
        MeditationComposition composition = composeContentUseCase.getComposition(compositionId);
        
        return ResponseEntity.ok(mapper.toCompositionResponse(composition));
    }
}
