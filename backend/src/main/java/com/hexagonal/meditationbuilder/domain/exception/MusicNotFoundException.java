package com.hexagonal.meditationbuilder.domain.exception;

/**
 * MusicNotFoundException - Domain exception for music not found in catalog.
 * 
 * Thrown when attempting to reference music that doesn't exist in the media catalog.
 * This is a business rule violation: users can only select music from the catalog.
 */
public class MusicNotFoundException extends RuntimeException {
    
    private final String musicId;
    
    public MusicNotFoundException(String musicId) {
        super("Music not found in catalog: " + musicId);
        this.musicId = musicId;
    }
    
    public MusicNotFoundException(String musicId, Throwable cause) {
        super("Music not found in catalog: " + musicId, cause);
        this.musicId = musicId;
    }
    
    public String getMusicId() {
        return musicId;
    }
}
