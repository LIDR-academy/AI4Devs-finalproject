package com.company.covoituraje.notification.config;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class VapidConfig {
    
    private String publicKey = System.getenv("VAPID_PUBLIC_KEY");
    private String privateKey = System.getenv("VAPID_PRIVATE_KEY");
    private String subject = System.getenv().getOrDefault("VAPID_SUBJECT", "mailto:admin@covoituraje.com");
    
    public String getPublicKey() {
        return publicKey;
    }
    
    public String getPrivateKey() {
        return privateKey;
    }
    
    public String getSubject() {
        return subject;
    }
}
