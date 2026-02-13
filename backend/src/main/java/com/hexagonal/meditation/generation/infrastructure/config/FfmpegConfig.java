package com.hexagonal.meditation.generation.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * FFmpeg configuration properties.
 * Allows configuring FFmpeg path and fallback behavior.
 */
@Configuration
@ConfigurationProperties(prefix = "ffmpeg")
public class FfmpegConfig {
    
    /**
     * Path to FFmpeg executable.
     * Default: "ffmpeg" (expects it in system PATH).
     * Can be overridden with absolute path: e.g., "C:/ffmpeg/bin/ffmpeg.exe"
     */
    private String path = "ffmpeg";
    
    /**
     * Enable fallback to file copy when FFmpeg fails or is not found.
     * Useful for development when FFmpeg is not available.
     */
    private boolean enableFallback = true;
    
    public String getPath() {
        return path;
    }
    
    public void setPath(String path) {
        this.path = path;
    }
    
    public boolean isEnableFallback() {
        return enableFallback;
    }
    
    public void setEnableFallback(boolean enableFallback) {
        this.enableFallback = enableFallback;
    }
}
