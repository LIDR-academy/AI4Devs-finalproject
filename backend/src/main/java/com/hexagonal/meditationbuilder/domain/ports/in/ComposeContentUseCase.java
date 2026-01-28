package com.hexagonal.meditationbuilder.domain.ports.in;

import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.domain.model.MeditationComposition;
import com.hexagonal.meditationbuilder.domain.model.MusicReference;
import com.hexagonal.meditationbuilder.domain.model.TextContent;
import com.hexagonal.meditationbuilder.domain.enums.OutputType;

/**
 * ComposeContentUseCase - Inbound Port.
 * 
 * Defines all operations for composing meditation content.
 * Orchestrates text, music, and image selection.
 * 
 * Use Cases (from BDD scenarios):
 * 1. Create new composition (Scenario 1)
 * 2. Update text manually (Scenario 2)
 * 3. Select music from catalog (Scenario 7)
 * 4. Set image (manual or AI-generated) (Scenarios 4, 8)
 * 5. Remove image (Scenarios 5, 6)
 * 6. Get output type (Scenarios 5, 6)
 * 7. Retrieve composition
 * 
 * @author Meditation Builder Team
 */
public interface ComposeContentUseCase {

    /**
     * Creates a new meditation composition.
     * 
     * Business Rule: Initial composition contains only text.
     * 
     * @param textContent initial meditation text (mandatory)
     * @return newly created composition with unique ID
     * @throws IllegalArgumentException if textContent is null
     */
    MeditationComposition createComposition(TextContent textContent);

    /**
     * Updates the text content of an existing composition.
     * 
     * Business Rule: Text is preserved exactly as provided.
     * 
     * @param compositionId unique composition identifier
     * @param newTextContent new meditation text
     * @return updated composition
     * @throws IllegalArgumentException if compositionId or newTextContent is null
     * @throws CompositionNotFoundException if composition not found
     */
    MeditationComposition updateText(String compositionId, TextContent newTextContent);

    /**
     * Selects background music from the media catalog.
     * 
     * Business Rule: Music is optional.
     * 
     * @param compositionId unique composition identifier
     * @param musicReference music catalog reference
     * @return updated composition
     * @throws IllegalArgumentException if compositionId or musicReference is null
     * @throws CompositionNotFoundException if composition not found
     */
    MeditationComposition selectMusic(String compositionId, MusicReference musicReference);

    /**
     * Sets an image for the composition.
     * 
     * Business Rule: Setting image changes output type to VIDEO.
     * 
     * @param compositionId unique composition identifier
     * @param imageReference image reference (manual or AI-generated)
     * @return updated composition
     * @throws IllegalArgumentException if compositionId or imageReference is null
     * @throws CompositionNotFoundException if composition not found
     */
    MeditationComposition setImage(String compositionId, ImageReference imageReference);

    /**
     * Removes the image from the composition.
     * 
     * Business Rule: Removing image changes output type to PODCAST.
     * 
     * @param compositionId unique composition identifier
     * @return updated composition
     * @throws IllegalArgumentException if compositionId is null
     * @throws CompositionNotFoundException if composition not found
     */
    MeditationComposition removeImage(String compositionId);

    /**
     * Retrieves the output type for a composition.
     * 
     * Business Rule:
     * - No image → PODCAST
     * - Has image → VIDEO
     * 
     * @param compositionId unique composition identifier
     * @return PODCAST or VIDEO
     * @throws IllegalArgumentException if compositionId is null
     * @throws CompositionNotFoundException if composition not found
     */
    OutputType getOutputType(String compositionId);

    /**
     * Retrieves a composition by ID.
     * 
     * @param compositionId unique composition identifier
     * @return the composition
     * @throws IllegalArgumentException if compositionId is null
     * @throws CompositionNotFoundException if composition not found
     */
    MeditationComposition getComposition(String compositionId);

    /**
     * Exception thrown when a composition is not found.
     */
    class CompositionNotFoundException extends RuntimeException {
        public CompositionNotFoundException(String compositionId) {
            super("Composition not found: " + compositionId);
        }
    }
}
