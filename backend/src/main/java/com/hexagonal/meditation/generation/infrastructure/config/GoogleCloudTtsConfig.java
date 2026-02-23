package com.hexagonal.meditation.generation.infrastructure.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.texttospeech.v1.TextToSpeechClient;
import com.google.cloud.texttospeech.v1.TextToSpeechSettings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Google Cloud Text-to-Speech configuration.
 * Supports multiple authentication methods:
 * 1. File path (google-cloud.tts.credentials-path)
 * 2. Base64-encoded JSON (google-cloud.tts.credentials-json)
 * 3. Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS env var)
 */
@Configuration
@ConfigurationProperties(prefix = "google-cloud.tts")
public class GoogleCloudTtsConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(GoogleCloudTtsConfig.class);
    
    private boolean enabled = false;
    private String credentialsPath;
    private String credentialsJson;
    private VoiceSettings voice = new VoiceSettings();
    private AudioSettings audio = new AudioSettings();
    
    /**
     * Creates TextToSpeechClient bean if Google Cloud TTS is enabled.
     * Bean is only created when google-cloud.tts.enabled=true.
     * Otherwise, adapter will use FFmpeg fallback for voice synthesis.
     */
    @Bean
    @ConditionalOnProperty(
        name = "google-cloud.tts.enabled",
        havingValue = "true",
        matchIfMissing = false
    )
    public TextToSpeechClient textToSpeechClient() throws IOException {
        logger.info("Initializing Google Cloud Text-to-Speech client...");
        
        GoogleCredentials credentials = loadCredentials();
        
        TextToSpeechSettings settings = TextToSpeechSettings.newBuilder()
            .setCredentialsProvider(() -> credentials)
            .build();
        
        TextToSpeechClient client = TextToSpeechClient.create(settings);
        logger.info("Google Cloud TTS client initialized successfully");
        
        return client;
    }
    
    /**
     * Loads Google Cloud credentials in priority order:
     * 1. Base64-encoded JSON (credentials-json)
     * 2. File path (credentials-path)
     * 3. Application Default Credentials (env var GOOGLE_APPLICATION_CREDENTIALS)
     */
    private GoogleCredentials loadCredentials() throws IOException {
        // Option 1: Base64-encoded JSON (for containerized environments)
        if (credentialsJson != null && !credentialsJson.isBlank()) {
            logger.info("Loading Google credentials from base64-encoded JSON");
            byte[] decodedJson = Base64.getDecoder().decode(credentialsJson);
            ByteArrayInputStream credentialsStream = new ByteArrayInputStream(decodedJson);
            return GoogleCredentials.fromStream(credentialsStream);
        }
        
        // Option 2: File path
        if (credentialsPath != null && !credentialsPath.isBlank()) {
            logger.info("Loading Google credentials from file: {}", credentialsPath);
            try (FileInputStream credentialsStream = new FileInputStream(credentialsPath)) {
                return GoogleCredentials.fromStream(credentialsStream);
            }
        }
        
        // Option 3: Application Default Credentials
        logger.info("Loading Google Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS env var)");
        return GoogleCredentials.getApplicationDefault();
    }
    
    // Getters and setters
    
    public boolean isEnabled() {
        return enabled;
    }
    
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
    
    public String getCredentialsPath() {
        return credentialsPath;
    }
    
    public void setCredentialsPath(String credentialsPath) {
        this.credentialsPath = credentialsPath;
    }
    
    public String getCredentialsJson() {
        return credentialsJson;
    }
    
    public void setCredentialsJson(String credentialsJson) {
        this.credentialsJson = credentialsJson;
    }
    
    public VoiceSettings getVoice() {
        return voice;
    }
    
    public void setVoice(VoiceSettings voice) {
        this.voice = voice;
    }
    
    public AudioSettings getAudio() {
        return audio;
    }
    
    public void setAudio(AudioSettings audio) {
        this.audio = audio;
    }
    
    /**
     * Voice configuration settings
     */
    public static class VoiceSettings {
        private String languageCode = "es-ES";
        private String name = "es-ES-Standard-B";
        private String gender = "MALE";
        
        public String getLanguageCode() {
            return languageCode;
        }
        
        public void setLanguageCode(String languageCode) {
            this.languageCode = languageCode;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getGender() {
            return gender;
        }
        
        public void setGender(String gender) {
            this.gender = gender;
        }
    }
    
    /**
     * Audio output configuration settings
     */
    public static class AudioSettings {
        private String encoding = "MP3";
        private int sampleRate = 48000;
        private double speakingRate = 0.85;
        private double pitch = 0.0;
        private double volumeGainDb = 0.0;
        
        public String getEncoding() {
            return encoding;
        }
        
        public void setEncoding(String encoding) {
            this.encoding = encoding;
        }
        
        public int getSampleRate() {
            return sampleRate;
        }
        
        public void setSampleRate(int sampleRate) {
            this.sampleRate = sampleRate;
        }
        
        public double getSpeakingRate() {
            return speakingRate;
        }
        
        public void setSpeakingRate(double speakingRate) {
            this.speakingRate = speakingRate;
        }
        
        public double getPitch() {
            return pitch;
        }
        
        public void setPitch(double pitch) {
            this.pitch = pitch;
        }
        
        public double getVolumeGainDb() {
            return volumeGainDb;
        }
        
        public void setVolumeGainDb(double volumeGainDb) {
            this.volumeGainDb = volumeGainDb;
        }
    }
}
