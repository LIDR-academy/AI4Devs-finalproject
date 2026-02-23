package com.hexagonal.meditationbuilder.domain.ports.out;

import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.domain.model.MusicReference;

import java.util.List;

/**
 * MediaCatalogPort - Outbound Port.
 * 
 * Defines operations for accessing the media catalog (music and images).
 * 
 * Use Cases:
 * - Preview available music (Scenario 7)
 * - Preview available images (Scenario 8)
 * - Validate music/image references
 * 
 * Implementation will be provided by infrastructure adapters.
 * 
 * @author Meditation Builder Team
 */
public interface MediaCatalogPort {

    /**
     * Retrieves available music tracks for preview.
     * 
     * Business Rule: Returns list of available background music.
     * 
     * @return list of music references (may be empty, never null)
     */
    List<MusicReference> getAvailableMusic();

    /**
     * Retrieves available images for preview.
     * 
     * Business Rule: Returns list of available images (manual selection).
     * 
     * @return list of image references (may be empty, never null)
     */
    List<ImageReference> getAvailableImages();

    /**
     * Validates that a music reference exists in the catalog.
     * 
     * @param musicReference music reference to validate
     * @return true if music exists in catalog
     * @throws IllegalArgumentException if musicReference is null
     */
    boolean musicExists(MusicReference musicReference);

    /**
     * Validates that an image reference exists in the catalog.
     * 
     * @param imageReference image reference to validate
     * @return true if image exists in catalog
     * @throws IllegalArgumentException if imageReference is null
     */
    boolean imageExists(ImageReference imageReference);
}
