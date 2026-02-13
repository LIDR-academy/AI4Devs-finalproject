package com.hexagonal.meditation.generation.infrastructure.out.adapter.ffmpeg;

import com.hexagonal.meditation.generation.domain.ports.out.AudioRenderingPort;
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
 * FFmpeg-based audio renderer for meditation content.
 * Mixes narration and background music at 48kHz stereo.
 * Applies loudnorm filter for consistent volume levels.
 */
@Component
public class FfmpegAudioRendererAdapter implements AudioRenderingPort {
    
    private static final Logger logger = LoggerFactory.getLogger(FfmpegAudioRendererAdapter.class);
    
    private final FfmpegConfig ffmpegConfig;
    
    public FfmpegAudioRendererAdapter(FfmpegConfig ffmpegConfig) {
        this.ffmpegConfig = ffmpegConfig;
    }
    
    @Override
    public Path renderAudio(AudioRenderRequest request) {
        logger.info("Rendering audio: narration={}, music={}, output={}", 
            request.narrationAudioPath(), request.musicAudioPath(), request.outputPath());
        
        try {
            // Ensure input files exist before calling ffmpeg
            if (!Files.exists(request.narrationAudioPath())) {
                throw new IOException("Narration file does not exist: " + request.narrationAudioPath());
            }

            // Build command
            List<String> command = new ArrayList<>();
            command.add(ffmpegConfig.getPath());
            command.add("-y"); // Overwrite output
            command.add("-i");
            command.add(request.narrationAudioPath().toAbsolutePath().toString());
            
            if (request.musicAudioPath() != null && Files.exists(request.musicAudioPath())) {
                command.add("-i");
                command.add(request.musicAudioPath().toAbsolutePath().toString());
                command.add("-filter_complex");
                // Mix narration and music, normalize volume
                command.add("[0:a][1:a]amix=inputs=2:duration=longest,loudnorm[aout]");
                command.add("-map");
                command.add("[aout]");
            } else {
                command.add("-af");
                command.add("loudnorm");
            }
            
            command.add("-ar");
            command.add(String.valueOf(request.config().sampleRate()));
            command.add("-ac");
            command.add(String.valueOf(request.config().channels()));
            command.add(request.outputPath().toAbsolutePath().toString());

            logger.debug("Executing FFmpeg command: {}", String.join(" ", command));
            
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            // Read output to avoid blocking
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                    logger.debug("FFmpeg: {}", line);
                }
            }
            
            int exitCode = process.waitFor();
            
            if (exitCode == 0) {
                logger.info("Audio rendering completed via FFmpeg: {}", request.outputPath());
                if (Files.exists(request.outputPath())) {
                    long fileSize = Files.size(request.outputPath());
                    logger.info("Audio file size: {} bytes", fileSize);
                }
                return request.outputPath();
            } else {
                logger.error("FFmpeg failed with exit code {}. Output:\n{}", exitCode, output);
                logger.error("FFmpeg command was: {}", String.join(" ", command));
                if (ffmpegConfig.isEnableFallback()) {
                    logger.warn("Falling back to copy mode");
                } else {
                    throw new RuntimeException("FFmpeg failed with exit code " + exitCode);
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("FFmpeg process interrupted", e);
            if (!ffmpegConfig.isEnableFallback()) {
                throw new RuntimeException("Audio rendering failed: FFmpeg process interrupted", e);
            }
        } catch (IOException e) {
            logger.error("FFmpeg not found or IO error: {}", e.getMessage(), e);
            if (!ffmpegConfig.isEnableFallback()) {
                throw new RuntimeException("Audio rendering failed: " + e.getMessage() + ". Please install FFmpeg or set ffmpeg.path in application.yml", e);
            } else {
                logger.warn("Falling back to copy mode for development");
            }
        }

        // FALLBACK: If FFmpeg is missing or fails AND fallback is enabled
        if (!ffmpegConfig.isEnableFallback()) {
            throw new RuntimeException("Audio rendering failed and fallback is disabled");
        }
        try {
            Files.copy(request.narrationAudioPath(), request.outputPath());
            logger.info("Audio rendering completed via FALLBACK (copy): {}", request.outputPath());
            return request.outputPath();
        } catch (IOException e) {
            logger.error("Failed to execute audio fallback", e);
            throw new RuntimeException("Audio rendering failed (both FFmpeg and Fallback)", e);
        }
    }
}
