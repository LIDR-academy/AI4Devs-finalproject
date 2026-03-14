package com.hexagonal.meditation.generation.application.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

/**
 * Generates idempotency keys for meditation generation requests.
 * Uses SHA-256 hash of userId|text|music|image to deduplicate identical requests.
 */
public class IdempotencyKeyGenerator {
    
    private static final String DELIMITER = "|";
    private static final String HASH_ALGORITHM = "SHA-256";
    
    /**
     * Generates an idempotency key from request parameters.
     * The key is a SHA-256 hash of: userId|narrationText|musicRef|imageRef
     * 
     * @param userId The user making the request
     * @param narrationText The narration text content
     * @param musicReference The music reference (optional)
     * @param imageReference The image reference (optional, null for audio-only)
     * @return SHA-256 hash as hexadecimal string
     */
    public String generate(UUID userId, String narrationText, String musicReference, String imageReference) {
        if (userId == null) {
            throw new IllegalArgumentException("userId cannot be null");
        }
        if (narrationText == null || narrationText.isBlank()) {
            throw new IllegalArgumentException("narrationText cannot be null or blank");
        }
        
        StringBuilder sb = new StringBuilder();
        sb.append(userId);
        sb.append(DELIMITER);
        sb.append(narrationText.trim());
        sb.append(DELIMITER);
        sb.append(musicReference != null ? musicReference.trim() : "");
        sb.append(DELIMITER);
        sb.append(imageReference != null ? imageReference.trim() : "");
        
        return hashSha256(sb.toString());
    }
    
    /**
     * Computes SHA-256 hash of input string.
     * 
     * @param input The string to hash
     * @return Hexadecimal representation of hash
     */
    private String hashSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is always available in modern JVMs
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
    
    /**
     * Converts byte array to hexadecimal string.
     * 
     * @param bytes The byte array
     * @return Hexadecimal string (lowercase)
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder(2 * bytes.length);
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
