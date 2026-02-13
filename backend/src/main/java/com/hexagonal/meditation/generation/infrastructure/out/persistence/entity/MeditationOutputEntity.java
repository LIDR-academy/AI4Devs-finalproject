package com.hexagonal.meditation.generation.infrastructure.out.persistence.entity;

import com.hexagonal.meditation.generation.domain.enums.GenerationStatus;
import com.hexagonal.meditation.generation.domain.enums.MediaType;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity for meditation generation persistence.
 * Maps to `generation.meditation_output` table.
 */
@Entity
@Table(name = "meditation_output", schema = "generation")
public class MeditationOutputEntity {
    
    @Id
    @Column(name = "meditation_id", nullable = false)
    private UUID meditationId;
    
    @Column(name = "composition_id", nullable = false)
    private UUID compositionId;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "idempotency_key", nullable = false, unique = true, length = 64)
    private String idempotencyKey;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 10)
    private MediaType mediaType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private GenerationStatus status;
    
    @Column(name = "narration_script_text", columnDefinition = "TEXT")
    private String narrationScriptText;
    
    @Column(name = "narration_script_duration_seconds")
    private Double narrationScriptDurationSeconds;
    
    @Column(name = "output_media_url", length = 500)
    private String outputMediaUrl;
    
    @Column(name = "subtitle_url", length = 500)
    private String subtitleUrl;
    
    @Column(name = "background_image_url", length = 500)
    private String backgroundImageUrl;
    
    @Column(name = "background_music_url", length = 500)
    private String backgroundMusicUrl;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    
    @Column(name = "completed_at")
    private Instant completedAt;
    
    // Constructors
    public MeditationOutputEntity() {
    }
    
    public MeditationOutputEntity(UUID meditationId, UUID compositionId, UUID userId, String idempotencyKey, 
                                  MediaType mediaType, GenerationStatus status, 
                                  String narrationScriptText, Double narrationScriptDurationSeconds,
                                  Instant createdAt) {
        this.meditationId = meditationId;
        this.compositionId = compositionId;
        this.userId = userId;
        this.idempotencyKey = idempotencyKey;
        this.mediaType = mediaType;
        this.status = status;
        this.narrationScriptText = narrationScriptText;
        this.narrationScriptDurationSeconds = narrationScriptDurationSeconds;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public UUID getMeditationId() {
        return meditationId;
    }
    
    public void setMeditationId(UUID meditationId) {
        this.meditationId = meditationId;
    }
    
    public UUID getCompositionId() {
        return compositionId;
    }
    
    public void setCompositionId(UUID compositionId) {
        this.compositionId = compositionId;
    }
    
    public UUID getUserId() {
        return userId;
    }
    
    public void setUserId(UUID userId) {
        this.userId = userId;
    }
    
    public String getIdempotencyKey() {
        return idempotencyKey;
    }
    
    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }
    
    public MediaType getMediaType() {
        return mediaType;
    }
    
    public void setMediaType(MediaType mediaType) {
        this.mediaType = mediaType;
    }
    
    public GenerationStatus getStatus() {
        return status;
    }
    
    public void setStatus(GenerationStatus status) {
        this.status = status;
    }
    
    public String getNarrationScriptText() {
        return narrationScriptText;
    }
    
    public void setNarrationScriptText(String narrationScriptText) {
        this.narrationScriptText = narrationScriptText;
    }
    
    public Double getNarrationScriptDurationSeconds() {
        return narrationScriptDurationSeconds;
    }
    
    public void setNarrationScriptDurationSeconds(Double narrationScriptDurationSeconds) {
        this.narrationScriptDurationSeconds = narrationScriptDurationSeconds;
    }
    
    public String getOutputMediaUrl() {
        return outputMediaUrl;
    }
    
    public void setOutputMediaUrl(String outputMediaUrl) {
        this.outputMediaUrl = outputMediaUrl;
    }
    
    public String getSubtitleUrl() {
        return subtitleUrl;
    }
    
    public void setSubtitleUrl(String subtitleUrl) {
        this.subtitleUrl = subtitleUrl;
    }
    
    public String getBackgroundImageUrl() {
        return backgroundImageUrl;
    }
    
    public void setBackgroundImageUrl(String backgroundImageUrl) {
        this.backgroundImageUrl = backgroundImageUrl;
    }
    
    public String getBackgroundMusicUrl() {
        return backgroundMusicUrl;
    }
    
    public void setBackgroundMusicUrl(String backgroundMusicUrl) {
        this.backgroundMusicUrl = backgroundMusicUrl;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public Instant getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
    
    public Instant getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }
}
