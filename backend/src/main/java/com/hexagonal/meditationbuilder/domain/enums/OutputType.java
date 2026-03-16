package com.hexagonal.meditationbuilder.domain.enums;

/**
 * OutputType Enum.
 * 
 * Represents the type of meditation output based on composition content.
 * 
 * Business Rules (from BDD Scenarios 5 & 6):
 * - PODCAST: Generated when NO image is selected (audio-only)
 * - VIDEO: Generated when image is selected (manual or AI-generated)
 * 
 * The output type is derived automatically based on the presence of an image.
 * 
 * @author Meditation Builder Team
 */
public enum OutputType {
    
    /**
     * Audio-only output (podcast format).
     * Used when composition has NO image selected.
     */
    PODCAST,
    
    /**
     * Video output.
     * Used when composition has an image selected (manual or AI-generated).
     */
    VIDEO
}
