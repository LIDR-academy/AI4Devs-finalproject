package com.hexagonal.playback.infrastructure.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA Entity mapping to generation.meditation_output table (created by US3).
 * READ-ONLY operations for Playback BC.
 * 
 * This entity represents meditation outputs stored by the meditation.generation BC.
 * The Playback BC only reads this data to provide meditation library and playback functionality.
 */
@Entity
@Table(name = "meditation_output", schema = "generation")
public class MeditationEntity {

    @Id
    @Column(name = "meditation_id", nullable = false)
    private UUID meditationId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "narration_script_text", columnDefinition = "TEXT")
    private String narrationScriptText;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "media_type", nullable = false, length = 10)
    private String mediaType;

    @Column(name = "output_media_url")
    private String outputMediaUrl;

    @Column(name = "background_image_url")
    private String backgroundImageUrl;

    @Column(name = "subtitle_url")
    private String subtitleUrl;

    // JPA requires no-arg constructor
    protected MeditationEntity() {
    }

    public MeditationEntity(UUID meditationId, UUID userId, String narrationScriptText, 
                           Instant createdAt, String status, String outputMediaUrl, 
                           String backgroundImageUrl, String subtitleUrl) {
        this.meditationId = meditationId;
        this.userId = userId;
        this.narrationScriptText = narrationScriptText;
        this.createdAt = createdAt;
        this.status = status;
        this.outputMediaUrl = outputMediaUrl;
        this.backgroundImageUrl = backgroundImageUrl;
        this.subtitleUrl = subtitleUrl;
    }

    public UUID getMeditationId() {
        return meditationId;
    }

    public void setMeditationId(UUID meditationId) {
        this.meditationId = meditationId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getNarrationScriptText() {
        return narrationScriptText;
    }

    public void setNarrationScriptText(String narrationScriptText) {
        this.narrationScriptText = narrationScriptText;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public String getOutputMediaUrl() {
        return outputMediaUrl;
    }

    public void setOutputMediaUrl(String outputMediaUrl) {
        this.outputMediaUrl = outputMediaUrl;
    }

    public String getBackgroundImageUrl() {
        return backgroundImageUrl;
    }

    public void setBackgroundImageUrl(String backgroundImageUrl) {
        this.backgroundImageUrl = backgroundImageUrl;
    }

    public String getSubtitleUrl() {
        return subtitleUrl;
    }

    public void setSubtitleUrl(String subtitleUrl) {
        this.subtitleUrl = subtitleUrl;
    }
}
