package com.company.covoituraje.notification.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_subscriptions", schema = "notifications")
public class NotificationSubscription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "endpoint", nullable = false, length = 2048)
    private String endpoint;
    
    @Column(name = "p256dh_key", nullable = false)
    private String p256dhKey;
    
    @Column(name = "auth_key", nullable = false)
    private String authKey;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "last_used", nullable = false)
    private LocalDateTime lastUsed;
    
    @Column(name = "is_active", nullable = false)
    private boolean active = true;
    
    // Constructors
    public NotificationSubscription() {}
    
    public NotificationSubscription(String userId, String endpoint, String p256dhKey, String authKey) {
        this.userId = userId;
        this.endpoint = endpoint;
        this.p256dhKey = p256dhKey;
        this.authKey = authKey;
        this.createdAt = LocalDateTime.now();
        this.lastUsed = LocalDateTime.now();
    }
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (lastUsed == null) {
            lastUsed = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        lastUsed = LocalDateTime.now();
    }
    
    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
    
    public String getP256dhKey() { return p256dhKey; }
    public void setP256dhKey(String p256dhKey) { this.p256dhKey = p256dhKey; }
    
    public String getAuthKey() { return authKey; }
    public void setAuthKey(String authKey) { this.authKey = authKey; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getLastUsed() { return lastUsed; }
    public void setLastUsed(LocalDateTime lastUsed) { this.lastUsed = lastUsed; }
    
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
