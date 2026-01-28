package com.hexagonal.meditationbuilder.domain.model;

import com.hexagonal.meditationbuilder.domain.enums.OutputType;

/**
 * MeditationComposition Aggregate Root.
 * 
 * Core domain entity representing a meditation composition with:
 * - Unique identifier
 * - Text content (mandatory)
 * - Music reference (optional)
 * - Image reference (optional)
 * 
 * Business Rules (from BDD scenarios):
 * 1. Text is mandatory and preserved exactly
 * 2. Music is optional
 * 3. Image is optional (manual or AI-generated)
 * 4. Output type is derived from image presence:
 *    - No image → PODCAST (audio-only)
 *    - Has image → VIDEO
 * 
 * Domain Invariants:
 * - ID cannot be null or empty
 * - Text content cannot be null
 * - Output type is always derivable
 * 
 * @author Meditation Builder Team
 */
public class MeditationComposition {

    private final String id;
    private TextContent textContent;
    private MusicReference musicReference;
    private ImageReference imageReference;

    /**
     * Creates a new composition with text only.
     * 
     * @param id unique composition identifier
     * @param textContent meditation text (mandatory)
     * @throws IllegalArgumentException if id or textContent is invalid
     */
    public MeditationComposition(String id, TextContent textContent) {
        this(id, textContent, null, null);
    }

    /**
     * Creates a new composition with all optional elements.
     * 
     * @param id unique composition identifier
     * @param textContent meditation text (mandatory)
     * @param musicReference background music reference (optional)
     * @param imageReference image reference (optional)
     * @throws IllegalArgumentException if id or textContent is invalid
     */
    public MeditationComposition(
            String id, 
            TextContent textContent, 
            MusicReference musicReference, 
            ImageReference imageReference) {
        
        if (id == null) {
            throw new IllegalArgumentException("Composition ID cannot be null");
        }
        if (id.isEmpty()) {
            throw new IllegalArgumentException("Composition ID cannot be empty");
        }
        if (id.isBlank()) {
            throw new IllegalArgumentException("Composition ID cannot be blank");
        }
        if (textContent == null) {
            throw new IllegalArgumentException("Text content is mandatory");
        }
        
        this.id = id;
        this.textContent = textContent;
        this.musicReference = musicReference;
        this.imageReference = imageReference;
    }

    /**
     * Returns the composition identifier.
     * 
     * @return unique ID
     */
    public String getId() {
        return id;
    }

    /**
     * Returns the text content.
     * 
     * @return meditation text (never null)
     */
    public TextContent getTextContent() {
        return textContent;
    }

    /**
     * Returns the music reference.
     * 
     * @return music reference or null if not set
     */
    public MusicReference getMusicReference() {
        return musicReference;
    }

    /**
     * Returns the image reference.
     * 
     * @return image reference or null if not set
     */
    public ImageReference getImageReference() {
        return imageReference;
    }

    /**
     * Returns the output type based on image presence.
     * 
     * Business Rule:
     * - No image → PODCAST (audio-only)
     * - Has image → VIDEO
     * 
     * @return PODCAST or VIDEO
     */
    public OutputType getOutputType() {
        return imageReference == null ? OutputType.PODCAST : OutputType.VIDEO;
    }

    /**
     * Updates the text content.
     * 
     * @param newTextContent new meditation text
     * @throws IllegalArgumentException if newTextContent is null
     */
    public void updateText(TextContent newTextContent) {
        if (newTextContent == null) {
            throw new IllegalArgumentException("Text content cannot be null");
        }
        this.textContent = newTextContent;
    }

    /**
     * Selects background music.
     * 
     * @param musicReference music reference (can be null to remove)
     */
    public void selectMusic(MusicReference musicReference) {
        this.musicReference = musicReference;
    }

    /**
     * Sets the image reference (manual or AI-generated).
     * Changes output type to VIDEO.
     * 
     * @param imageReference image reference
     * @throws IllegalArgumentException if imageReference is null
     */
    public void setImage(ImageReference imageReference) {
        if (imageReference == null) {
            throw new IllegalArgumentException("Image reference cannot be null (use removeImage() instead)");
        }
        this.imageReference = imageReference;
    }

    /**
     * Removes the image reference.
     * Changes output type to PODCAST.
     */
    public void removeImage() {
        this.imageReference = null;
    }

    /**
     * Checks if composition has an image.
     * 
     * @return true if image is present
     */
    public boolean hasImage() {
        return imageReference != null;
    }

    /**
     * Checks if composition has music.
     * 
     * @return true if music is present
     */
    public boolean hasMusic() {
        return musicReference != null;
    }
}
