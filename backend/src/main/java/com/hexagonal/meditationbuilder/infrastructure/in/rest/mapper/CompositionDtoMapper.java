package com.hexagonal.meditationbuilder.infrastructure.in.rest.mapper;

import com.hexagonal.meditationbuilder.domain.enums.OutputType;
import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.domain.model.MeditationComposition;
import com.hexagonal.meditationbuilder.domain.model.MusicReference;
import com.hexagonal.meditationbuilder.domain.model.TextContent;
import com.hexagonal.meditationbuilder.infrastructure.in.rest.dto.*;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Mapper for converting between domain models and REST DTOs.
 * 
 * Bidirectional mapping:
 * - Domain → DTO: For responses
 * - DTO → Domain: For requests
 * 
 * Architecture: Part of infrastructure layer, depends on domain but not vice versa.
 */
@Component
public class CompositionDtoMapper {

    // ========== Domain → DTO Mappings (Responses) ==========

    /**
     * Maps MeditationComposition domain entity to CompositionResponse DTO.
     * 
     * @param composition domain entity
     * @return REST response DTO
     */
    public CompositionResponse toCompositionResponse(MeditationComposition composition) {
        Objects.requireNonNull(composition, "composition must not be null");
        
        return new CompositionResponse(
                composition.id(),
                composition.textContent().value(),
                composition.musicReference() != null 
                        ? composition.musicReference().value() 
                        : null,
                composition.imageReference() != null 
                        ? composition.imageReference().value() 
                        : null,
                composition.outputType().name(),
                composition.createdAt(),
                composition.updatedAt()
        );
    }

    /**
     * Maps TextContent domain value object to TextContentResponse DTO.
     * 
     * @param textContent domain value object
     * @return REST response DTO
     */
    public TextContentResponse toTextContentResponse(TextContent textContent) {
        Objects.requireNonNull(textContent, "textContent must not be null");
        return new TextContentResponse(textContent.value());
    }

    /**
     * Maps ImageReference domain value object to ImageReferenceResponse DTO.
     * 
     * @param imageReference domain value object
     * @return REST response DTO
     */
    public ImageReferenceResponse toImageReferenceResponse(ImageReference imageReference) {
        Objects.requireNonNull(imageReference, "imageReference must not be null");
        return new ImageReferenceResponse(imageReference.value());
    }

    /**
     * Maps OutputType domain enum to OutputTypeResponse DTO.
     * 
     * @param outputType domain enum
     * @return REST response DTO
     */
    public OutputTypeResponse toOutputTypeResponse(OutputType outputType) {
        Objects.requireNonNull(outputType, "outputType must not be null");
        return new OutputTypeResponse(outputType.name());
    }

    /**
     * Creates MusicPreviewResponse from composition's music reference.
     * 
     * @param composition domain entity with selected music
     * @param previewBaseUrl base URL for preview endpoint
     * @return REST response DTO
     * @throws IllegalStateException if composition has no music selected
     */
    public MusicPreviewResponse toMusicPreviewResponse(MeditationComposition composition, String previewBaseUrl) {
        Objects.requireNonNull(composition, "composition must not be null");
        
        MusicReference musicRef = composition.musicReference();
        if (musicRef == null) {
            throw new IllegalStateException("No music selected for preview");
        }
        
        String previewUrl = previewBaseUrl + "/music/" + musicRef.value();
        return new MusicPreviewResponse(previewUrl, musicRef.value());
    }

    /**
     * Creates ImagePreviewResponse from composition's image reference.
     * 
     * @param composition domain entity with selected image
     * @param previewBaseUrl base URL for preview endpoint
     * @return REST response DTO
     * @throws IllegalStateException if composition has no image selected
     */
    public ImagePreviewResponse toImagePreviewResponse(MeditationComposition composition, String previewBaseUrl) {
        Objects.requireNonNull(composition, "composition must not be null");
        
        ImageReference imageRef = composition.imageReference();
        if (imageRef == null) {
            throw new IllegalStateException("No image selected for preview");
        }
        
        String previewUrl = previewBaseUrl + "/images/" + imageRef.value();
        return new ImagePreviewResponse(previewUrl, imageRef.value());
    }

    // ========== DTO → Domain Mappings (Requests) ==========

    /**
     * Creates TextContent domain value object from request text.
     * 
     * @param text raw text string from request
     * @return domain value object
     */
    public TextContent toTextContent(String text) {
        Objects.requireNonNull(text, "text must not be null");
        return new TextContent(text);
    }

    /**
     * Creates MusicReference domain value object from request.
     * 
     * @param musicReference raw music reference string from request
     * @return domain value object
     */
    public MusicReference toMusicReference(String musicReference) {
        Objects.requireNonNull(musicReference, "musicReference must not be null");
        return new MusicReference(musicReference);
    }

    /**
     * Creates ImageReference domain value object from request.
     * 
     * @param imageReference raw image reference string from request
     * @return domain value object
     */
    public ImageReference toImageReference(String imageReference) {
        Objects.requireNonNull(imageReference, "imageReference must not be null");
        return new ImageReference(imageReference);
    }
}
