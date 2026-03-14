package com.hexagonal.meditation.generation.infrastructure.out.service.audio;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service to analyze audio file metadata using FFprobe.
 * Extracts duration, bitrate, sample rate, and other properties.
 */
@Service
public class AudioMetadataService {
    
    private static final Logger logger = LoggerFactory.getLogger(AudioMetadataService.class);
    
    // Pattern to extract Duration from ffprobe output: "Duration: 00:03:45.67"
    private static final Pattern DURATION_PATTERN = Pattern.compile("Duration: (\\d{2}):(\\d{2}):(\\d{2})\\.(\\d{2})");
    
    private final String ffprobePath;
    
    public AudioMetadataService() {
        // ffprobe is typically installed alongside ffmpeg
        this.ffprobePath = System.getProperty("ffprobe.path", "ffprobe");
    }
    
    /**
     * Get the duration of an audio file in seconds.
     * 
     * @param audioFile path to audio file
     * @return duration in seconds (rounded to 2 decimals)
     * @throws IOException if file doesn't exist or ffprobe fails
     */
    public double getDurationSeconds(Path audioFile) throws IOException {
        if (!Files.exists(audioFile)) {
            throw new IOException("Audio file does not exist: " + audioFile);
        }
        
        logger.debug("Analyzing audio duration: {}", audioFile);
        
        try {
            List<String> command = new ArrayList<>();
            command.add(ffprobePath);
            command.add("-i");
            command.add(audioFile.toAbsolutePath().toString());
            command.add("-show_entries");
            command.add("format=duration");
            command.add("-v");
            command.add("quiet");
            command.add("-of");
            command.add("csv=p=0");
            
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            String output;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                output = reader.readLine(); // First line should be the duration
            }
            
            int exitCode = process.waitFor();
            
            if (exitCode == 0 && output != null && !output.isBlank()) {
                double duration = Double.parseDouble(output.trim());
                logger.info("Audio duration: {} seconds ({})", duration, audioFile.getFileName());
                return Math.round(duration * 100.0) / 100.0; // Round to 2 decimals
            }
            
            // Fallback: try parsing from stderr/stdout
            logger.warn("ffprobe didn't return duration in expected format, trying alternative parsing");
            return getDurationFallback(audioFile);
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("ffprobe process interrupted", e);
        } catch (NumberFormatException e) {
            logger.warn("Could not parse duration, trying fallback method");
            return getDurationFallback(audioFile);
        }
    }
    
    /**
     * Fallback method: parse duration from regular ffprobe output.
     */
    private double getDurationFallback(Path audioFile) throws IOException {
        try {
            List<String> command = new ArrayList<>();
            command.add(ffprobePath);
            command.add("-i");
            command.add(audioFile.toAbsolutePath().toString());
            
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
            
            process.waitFor();
            
            // Parse "Duration: 00:03:45.67, ..." from output
            Matcher matcher = DURATION_PATTERN.matcher(output);
            if (matcher.find()) {
                int hours = Integer.parseInt(matcher.group(1));
                int minutes = Integer.parseInt(matcher.group(2));
                int seconds = Integer.parseInt(matcher.group(3));
                int centiseconds = Integer.parseInt(matcher.group(4));
                
                double duration = hours * 3600.0 + minutes * 60.0 + seconds + centiseconds / 100.0;
                logger.info("Audio duration (fallback): {} seconds", duration);
                return Math.round(duration * 100.0) / 100.0;
            }
            
            throw new IOException("Could not determine audio duration from ffprobe output");
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("ffprobe process interrupted", e);
        }
    }
    
    /**
     * Check if the file is a valid audio file.
     */
    public boolean isValidAudioFile(Path audioFile) {
        try {
            getDurationSeconds(audioFile);
            return true;
        } catch (IOException e) {
            logger.debug("File is not a valid audio file: {}", audioFile);
            return false;
        }
    }
}
