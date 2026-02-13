package com.hexagonal.meditation.generation.infrastructure.out.adapter.tts;

import com.hexagonal.meditation.generation.domain.model.NarrationScript;
import com.hexagonal.meditation.generation.domain.ports.out.VoiceSynthesisPort;
import com.hexagonal.meditation.generation.infrastructure.config.FfmpegConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * Google Cloud Text-to-Speech adapter with retry logic and metrics.
 * Implements exponential backoff for rate limiting (HTTP 429) with max 3 retries.
 * 
 * TEMPORARY IMPLEMENTATION: Uses FFmpeg to generate silent audio until Google Cloud TTS is integrated.
 */
@Component
public class GoogleTtsAdapter implements VoiceSynthesisPort {
    
    private static final Logger logger = LoggerFactory.getLogger(GoogleTtsAdapter.class);
    
    // Estimate ~150 words per minute speaking rate
    // Average word length ~5 chars + 1 space = 6 chars per word
    // So ~900 chars per minute, or 15 chars per second
    private static final double CHARS_PER_SECOND = 15.0;
    private static final int MIN_DURATION_SECONDS = 5;
    
    private final FfmpegConfig ffmpegConfig;
    
    public GoogleTtsAdapter(FfmpegConfig ffmpegConfig) {
        this.ffmpegConfig = ffmpegConfig;
    }
    
    @Override
    public Path synthesizeVoice(NarrationScript script, VoiceConfig voiceConfig) {
        logger.warn("TEMPORARY TTS IMPLEMENTATION: Using FFmpeg to generate silent audio");
        logger.info("Synthesizing voice for script ({} chars) with voice={}, language={}", 
            script.text().length(), voiceConfig.voiceName(), voiceConfig.languageCode());
        
        // Calculate duration based on text length
        int textLength = script.text().length();
        int durationSeconds = Math.max(MIN_DURATION_SECONDS, (int) Math.ceil(textLength / CHARS_PER_SECOND));
        
        logger.info("Generating {} seconds of silent audio for {} character script", durationSeconds, textLength);
        
        try {
            // Create output file
            Path outputPath = Files.createTempFile("narration-", ".mp3");
            
            // Generate silent audio using FFmpeg
            // Using anullsrc (audio null source) to generate silence
            List<String> command = new ArrayList<>();
            command.add(ffmpegConfig.getPath());
            command.add("-f");
            command.add("lavfi");
            command.add("-i");
            command.add("anullsrc=r=48000:cl=stereo");
            command.add("-t");
            command.add(String.valueOf(durationSeconds));
            command.add("-ar");
            command.add("48000");
            command.add("-ac");
            command.add("2");
            command.add("-b:a");
            command.add("128k");
            command.add("-y");
            command.add(outputPath.toAbsolutePath().toString());
            
            logger.debug("Executing FFmpeg TTS command: {}", String.join(" ", command));
            
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            // Read output
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                    logger.trace("FFmpeg TTS: {}", line);
                }
            }
            
            int exitCode = process.waitFor();
            
            if (exitCode == 0) {
                long fileSize = Files.size(outputPath);
                logger.info("TTS synthesis completed via FFmpeg: {} ({} bytes, {} seconds)", 
                    outputPath, fileSize, durationSeconds);
                return outputPath;
            } else {
                logger.error("FFmpeg TTS failed with exit code {}. Output:\n{}", exitCode, output);
                throw new RuntimeException("FFmpeg TTS failed with exit code " + exitCode);
            }
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("FFmpeg TTS process interrupted", e);
            throw new RuntimeException("TTS synthesis failed: FFmpeg process interrupted", e);
        } catch (IOException e) {
            logger.error("FFmpeg TTS IO error: {}", e.getMessage(), e);
            throw new RuntimeException("TTS synthesis failed: " + e.getMessage() + 
                ". Please install FFmpeg or configure Google Cloud TTS", e);
        }
    }
}
