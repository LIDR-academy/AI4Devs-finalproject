package com.hexagonal.meditation.generation.infrastructure.out.adapter.ffmpeg;

import com.hexagonal.meditation.generation.domain.ports.out.VideoRenderingPort;
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
 * FFmpeg-based video renderer for meditation content.
 * Generates 1280x720 video at 48kHz stereo audio with burned-in subtitles.
 * Uses amix filter for narration + music blending.
 */
@Component
public class FfmpegVideoRendererAdapter implements VideoRenderingPort {
    
    private static final Logger logger = LoggerFactory.getLogger(FfmpegVideoRendererAdapter.class);
    
    private final FfmpegConfig ffmpegConfig;
    
    public FfmpegVideoRendererAdapter(FfmpegConfig ffmpegConfig) {
        this.ffmpegConfig = ffmpegConfig;
    }
    
    @Override
    public Path renderVideo(VideoRenderRequest request) {
        logger.info("Rendering video: narration={}, image={}, subtitles={}, music={}, output={}", 
            request.narrationAudioPath(), request.imagePath(), request.subtitlePath(), 
            request.musicAudioPath(), request.outputPath());
        
        try {
            // Ensure necessary input files exist
            if (!Files.exists(request.narrationAudioPath())) {
                throw new IOException("Narration file does not exist: " + request.narrationAudioPath());
            }
            if (!Files.exists(request.imagePath())) {
                throw new IOException("Image file does not exist: " + request.imagePath());
            }

            // Build command
            List<String> command = new ArrayList<>();
            command.add(ffmpegConfig.getPath());
            command.add("-y"); // Overwrite output
            command.add("-loop");
            command.add("1");
            command.add("-i");
            command.add(request.imagePath().toAbsolutePath().toString());
            command.add("-i");
            command.add(request.narrationAudioPath().toAbsolutePath().toString());
            
            boolean hasMusic = request.musicAudioPath() != null && Files.exists(request.musicAudioPath());
            if (hasMusic) {
                command.add("-i");
                command.add(request.musicAudioPath().toAbsolutePath().toString());
            }
            
            // Filters
            StringBuilder vf = new StringBuilder();
            vf.append("scale=1280:720,format=yuv420p");
            if (request.subtitlePath() != null && Files.exists(request.subtitlePath())) {
                // FFmpeg subtitles filter requires path with escaped backslashes on Windows
                String escapedPath = request.subtitlePath().toAbsolutePath().toString().replace("\\", "/").replace(":", "\\:");
                vf.append(",subtitles='").append(escapedPath).append("'");
            }
            command.add("-vf");
            command.add(vf.toString());
            
            if (hasMusic) {
                command.add("-filter_complex");
                command.add("[1:a][2:a]amix=inputs=2:duration=longest[aout]");
                command.add("-map");
                command.add("0:v");
                command.add("-map");
                command.add("[aout]");
            } else {
                command.add("-map");
                command.add("0:v");
                command.add("-map");
                command.add("1:a");
            }
            
            command.add("-ar");
            command.add("48000");
            command.add("-ac");
            command.add("2");
            command.add("-shortest");
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
                logger.info("Video rendering completed via FFmpeg: {}", request.outputPath());
                if (Files.exists(request.outputPath())) {
                    long fileSize = Files.size(request.outputPath());
                    logger.info("Video file size: {} bytes", fileSize);
                }
                return request.outputPath();
            } else {
                logger.error("FFmpeg failed with exit code {}. Output:\n{}", exitCode, output);
                logger.error("FFmpeg command was: {}", String.join(" ", command));
                if (ffmpegConfig.isEnableFallback()) {
                    logger.warn("Falling back to audio-only copy mode");
                } else {
                    throw new RuntimeException("FFmpeg failed with exit code " + exitCode);
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("FFmpeg process interrupted", e);
            if (!ffmpegConfig.isEnableFallback()) {
                throw new RuntimeException("Video rendering failed: FFmpeg process interrupted", e);
            }
        } catch (IOException e) {
            logger.error("FFmpeg not found or IO error: {}", e.getMessage(), e);
            if (!ffmpegConfig.isEnableFallback()) {
                throw new RuntimeException("Video rendering failed: " + e.getMessage() + ". Please install FFmpeg or set ffmpeg.path in application.yml", e);
            } else {
                logger.warn("Falling back to copy mode for development");
            }
        }

        // FALLBACK: If FFmpeg is missing or fails AND fallback is enabled
        if (!ffmpegConfig.isEnableFallback()) {
            throw new RuntimeException("Video rendering failed and fallback is disabled");
        }
        try {
            Files.copy(request.narrationAudioPath(), request.outputPath());
            logger.info("Video rendering completed via FALLBACK (copy): {}", request.outputPath());
            return request.outputPath();
        } catch (IOException e) {
            logger.error("Failed to execute video fallback", e);
            throw new RuntimeException("Video rendering failed (both FFmpeg and Fallback)", e);
        }
    }
}
