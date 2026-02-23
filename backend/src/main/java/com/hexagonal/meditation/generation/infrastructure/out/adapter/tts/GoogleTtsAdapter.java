package com.hexagonal.meditation.generation.infrastructure.out.adapter.tts;

import com.google.cloud.texttospeech.v1.*;
import com.google.protobuf.ByteString;
import com.hexagonal.meditation.generation.domain.model.NarrationScript;
import com.hexagonal.meditation.generation.domain.ports.out.VoiceSynthesisPort;
import com.hexagonal.meditation.generation.infrastructure.config.FfmpegConfig;
import com.hexagonal.meditation.generation.infrastructure.config.GoogleCloudTtsConfig;
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
import java.util.Optional;

/**
 * Google Cloud Text-to-Speech adapter with automatic fallback to FFmpeg.
 * 
 * Supports two modes:
 * 1. Google Cloud TTS (when enabled and configured)
 * 2. FFmpeg silent audio fallback (for development/testing)
 * 
 * Configuration via application.yml:
 * - google-cloud.tts.enabled: true/false
 * - google-cloud.tts.credentials-path: path to JSON key file
 * - google-cloud.tts.credentials-json: base64-encoded JSON (for containers)
 */
@Component
public class GoogleTtsAdapter implements VoiceSynthesisPort {
    
    private static final Logger logger = LoggerFactory.getLogger(GoogleTtsAdapter.class);
    
    // Estimate ~150 words per minute speaking rate for fallback duration
    private static final double CHARS_PER_SECOND = 15.0;
    private static final int MIN_DURATION_SECONDS = 5;
    
    private final Optional<TextToSpeechClient> ttsClient;
    private final GoogleCloudTtsConfig ttsConfig;
    private final FfmpegConfig ffmpegConfig;
    
    public GoogleTtsAdapter(
            Optional<TextToSpeechClient> ttsClient, 
            GoogleCloudTtsConfig ttsConfig,
            FfmpegConfig ffmpegConfig) {
        this.ttsClient = ttsClient;
        this.ttsConfig = ttsConfig;
        this.ffmpegConfig = ffmpegConfig;
    }
    
    @Override
    public Path synthesizeVoice(NarrationScript script, VoiceConfig voiceConfig) {
        // Use Google Cloud TTS if enabled and client is available
        if (ttsConfig.isEnabled() && ttsClient.isPresent()) {
            return synthesizeWithGoogleTtsAndPauses(script, voiceConfig);
        }
        
        // Fallback to FFmpeg silent audio
        logger.warn("Google Cloud TTS is disabled or not configured. Using FFmpeg silent audio fallback.");
        return synthesizeWithFfmpegFallback(script, 0.0);
    }

    @Override
    public Path synthesizeVoice(NarrationScript script, VoiceConfig voiceConfig, double targetDurationSeconds) {
        // Use Google Cloud TTS if enabled and client is available
        if (ttsConfig.isEnabled() && ttsClient.isPresent()) {
            if (targetDurationSeconds > 0) {
                return synthesizeWithDistributedPauses(script, voiceConfig, targetDurationSeconds);
            } else {
                return synthesizeWithGoogleTtsAndPauses(script, voiceConfig);
            }
        }
        
        // Fallback to FFmpeg silent audio
        logger.warn("Google Cloud TTS is disabled or not configured. Using FFmpeg silent audio fallback.");
        return synthesizeWithFfmpegFallback(script, targetDurationSeconds);
    }
    
    /**
     * Synthesize voice with natural pauses between sentences using SSML.
     * Adds 0.8-second pauses between sentences for better flow during meditation.
     */
    private Path synthesizeWithGoogleTtsAndPauses(NarrationScript script, VoiceConfig voiceConfig) {
        logger.info("Synthesizing voice with natural pauses: {} chars", script.text().length());
        
        try {
            TextToSpeechClient client = ttsClient.get();
            
            // Build SSML with pauses between sentences
            String ssmlText = buildSsmlWithNaturalPauses(script.text());
            SynthesisInput input = SynthesisInput.newBuilder()
                .setSsml(ssmlText)
                .build();
            
            // Build voice selection
            VoiceSelectionParams voice = VoiceSelectionParams.newBuilder()
                .setLanguageCode(ttsConfig.getVoice().getLanguageCode())
                .setName(ttsConfig.getVoice().getName())
                .setSsmlGender(SsmlVoiceGender.valueOf(ttsConfig.getVoice().getGender()))
                .build();
            
            // Build audio config
            AudioConfig audioConfig = AudioConfig.newBuilder()
                .setAudioEncoding(AudioEncoding.valueOf(ttsConfig.getAudio().getEncoding()))
                .setSampleRateHertz(ttsConfig.getAudio().getSampleRate())
                .setSpeakingRate(ttsConfig.getAudio().getSpeakingRate())
                .setPitch(ttsConfig.getAudio().getPitch())
                .setVolumeGainDb(ttsConfig.getAudio().getVolumeGainDb())
                .build();
            
            logger.debug("Google TTS request: voice={}, language={}, speaking-rate={}", 
                voice.getName(), voice.getLanguageCode(), audioConfig.getSpeakingRate());
            
            // Perform the text-to-speech request
            SynthesizeSpeechResponse response = client.synthesizeSpeech(input, voice, audioConfig);
            
            // Get the audio contents
            ByteString audioContents = response.getAudioContent();
            
            // Write to temporary file
            Path outputPath = Files.createTempFile("narration-", ".mp3");
            Files.write(outputPath, audioContents.toByteArray());
            
            long fileSize = Files.size(outputPath);
            logger.info("Google TTS synthesis completed: {} ({} bytes)", outputPath, fileSize);
            
            return outputPath;
            
        } catch (Exception e) {
            logger.error("Google Cloud TTS failed: {}. Falling back to FFmpeg.", e.getMessage(), e);
            
            // Fallback to FFmpeg if Google TTS fails
            return synthesizeWithFfmpegFallback(script, 0.0);
        }
    }
    
    /**
     * Build SSML text with natural pauses between sentences.
     * Adds 0.8-second pauses for meditation pacing.
     */
    private String buildSsmlWithNaturalPauses(String text) {
        // Split text into sentences
        String[] sentences = text.split("(?<=[.!?])\\s+");
        
        StringBuilder ssml = new StringBuilder();
        ssml.append("<speak>");
        
        for (int i = 0; i < sentences.length; i++) {
            String sentence = sentences[i].trim();
            if (sentence.isEmpty()) continue;
            
            ssml.append(escapeXml(sentence));
            
            // Add pause between sentences (except after the last one)
            if (i < sentences.length - 1) {
                ssml.append(" <break time=\"0.8s\"/>");
            }
        }
        
        ssml.append("</speak>");
        
        logger.debug("Generated SSML with {} sentences and natural pauses", sentences.length);
        return ssml.toString();
    }
    
    /**
     * Synthesize voice with pauses distributed across target duration.
     * Uses two-step approach:
     * 1. Synthesize without pauses to get REAL natural duration
     * 2. Calculate and add distributed pauses based on real duration
     */
    private Path synthesizeWithDistributedPauses(NarrationScript script, VoiceConfig voiceConfig, double targetDurationSeconds) {
        logger.info("Synthesizing voice with distributed pauses: {} chars, target: {} seconds", 
            script.text().length(), targetDurationSeconds);
        
        try {
            TextToSpeechClient client = ttsClient.get();
            
            // STEP 1: Synthesize WITHOUT pauses to measure real natural duration
            logger.debug("Step 1: Synthesizing without pauses to measure real duration");
            Path naturalAudio = synthesizeWithoutPauses(script, voiceConfig, client);
            
            // Measure the REAL natural speech duration using ffprobe
            double naturalDuration;
            try {
                ProcessBuilder pb = new ProcessBuilder(
                    "ffprobe",
                    "-v", "error",
                    "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1",
                    naturalAudio.toAbsolutePath().toString()
                );
                pb.redirectErrorStream(true);
                Process process = pb.start();
                
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                    String durationStr = reader.readLine();
                    naturalDuration = Double.parseDouble(durationStr.trim());
                    logger.info("Real natural speech duration measured: {} seconds", naturalDuration);
                }
                
                process.waitFor();
                
            } catch (Exception e) {
                logger.warn("Could not measure natural audio duration, using estimation: {}", e.getMessage());
                double speakingRate = ttsConfig.getAudio().getSpeakingRate();
                double charsPerSecond = 15.0 * speakingRate;
                naturalDuration = script.text().length() / charsPerSecond;
            } finally {
                // Clean up temporary file
                try {
                    Files.deleteIfExists(naturalAudio);
                } catch (IOException e) {
                    logger.debug("Could not delete temporary file: {}", naturalAudio);
                }
            }
            
            // Calculate total pause time needed
            double totalPauseTime = Math.max(0, targetDurationSeconds - naturalDuration);
            
            // STEP 2: Synthesize WITH distributed pauses
            logger.debug("Step 2: Synthesizing with {} seconds of distributed pauses", totalPauseTime);
            
            // Build SSML with distributed pauses
            String ssmlText = buildSsmlWithDistributedPauses(script.text(), totalPauseTime);
            SynthesisInput input = SynthesisInput.newBuilder()
                .setSsml(ssmlText)
                .build();
            
            // Build voice selection
            VoiceSelectionParams voice = VoiceSelectionParams.newBuilder()
                .setLanguageCode(ttsConfig.getVoice().getLanguageCode())
                .setName(ttsConfig.getVoice().getName())
                .setSsmlGender(SsmlVoiceGender.valueOf(ttsConfig.getVoice().getGender()))
                .build();
            
            // Build audio config
            AudioConfig audioConfig = AudioConfig.newBuilder()
                .setAudioEncoding(AudioEncoding.valueOf(ttsConfig.getAudio().getEncoding()))
                .setSampleRateHertz(ttsConfig.getAudio().getSampleRate())
                .setSpeakingRate(ttsConfig.getAudio().getSpeakingRate())
                .setPitch(ttsConfig.getAudio().getPitch())
                .setVolumeGainDb(ttsConfig.getAudio().getVolumeGainDb())
                .build();
            
            logger.debug("Google TTS request: voice={}, language={}, speaking-rate={}", 
                voice.getName(), voice.getLanguageCode(), audioConfig.getSpeakingRate());
            
            // Perform the text-to-speech request
            SynthesizeSpeechResponse response = client.synthesizeSpeech(input, voice, audioConfig);
            
            // Get the audio contents
            ByteString audioContents = response.getAudioContent();
            
            // Write to temporary file
            Path outputPath = Files.createTempFile("narration-", ".mp3");
            Files.write(outputPath, audioContents.toByteArray());
            
            long fileSize = Files.size(outputPath);
            logger.info("Google TTS synthesis completed: {} ({} bytes, target: {} seconds)", 
                outputPath, fileSize, targetDurationSeconds);
            
            return outputPath;
            
        } catch (Exception e) {
            logger.error("Google Cloud TTS failed: {}. Falling back to FFmpeg.", e.getMessage(), e);
            
            // Fallback to FFmpeg if Google TTS fails
            return synthesizeWithFfmpegFallback(script, targetDurationSeconds);
        }
    }
    
    /**
     * Build SSML with pauses distributed between sentences.
     * Distributes the total pause time evenly across sentence breaks.
     * For pauses > 10s (Google TTS limit), splits them into multiple consecutive breaks.
     */
    private String buildSsmlWithDistributedPauses(String text, double totalPauseSeconds) {
        // Split text into sentences
        String[] sentences = text.split("(?<=[.!?])\\s+");
        
        // Calculate pause per sentence (distributed)
        int numPauses = sentences.length - 1; // pauses between sentences
        double pausePerBreak = numPauses > 0 ? totalPauseSeconds / numPauses : 0;
        
        StringBuilder ssml = new StringBuilder();
        ssml.append("<speak>");
        
        for (int i = 0; i < sentences.length; i++) {
            String sentence = sentences[i].trim();
            if (sentence.isEmpty()) continue;
            
            ssml.append(escapeXml(sentence));
            
            // Add pause between sentences (except after the last one)
            if (i < sentences.length - 1 && pausePerBreak > 0.1) {
                // For pauses > 10s, split into multiple breaks (Google TTS has 10s limit per break)
                double remainingPause = pausePerBreak;
                while (remainingPause > 0) {
                    double pauseDuration = Math.min(remainingPause, 10.0);
                    ssml.append(String.format(" <break time=\"%.1fs\"/>", pauseDuration));
                    remainingPause -= pauseDuration;
                }
            }
        }
        
        ssml.append("</speak>");
        
        logger.info("Generated SSML with {} sentences and {:.1f}s pauses between them (total pause time: {:.1f}s)", 
            sentences.length, pausePerBreak, totalPauseSeconds);
        
        return ssml.toString();
    }
    
    /**
     * Synthesize voice WITHOUT pauses to measure natural duration.
     * Used as first step in two-step synthesis process.
     */
    private Path synthesizeWithoutPauses(NarrationScript script, VoiceConfig voiceConfig, TextToSpeechClient client) throws IOException {
        // Build simple SSML without any pauses
        String ssmlText = "<speak>" + escapeXml(script.text()) + "</speak>";
        SynthesisInput input = SynthesisInput.newBuilder()
            .setSsml(ssmlText)
            .build();
        
        // Build voice selection
        VoiceSelectionParams voice = VoiceSelectionParams.newBuilder()
            .setLanguageCode(ttsConfig.getVoice().getLanguageCode())
            .setName(ttsConfig.getVoice().getName())
            .setSsmlGender(SsmlVoiceGender.valueOf(ttsConfig.getVoice().getGender()))
            .build();
        
        // Build audio config
        AudioConfig audioConfig = AudioConfig.newBuilder()
            .setAudioEncoding(AudioEncoding.valueOf(ttsConfig.getAudio().getEncoding()))
            .setSampleRateHertz(ttsConfig.getAudio().getSampleRate())
            .setSpeakingRate(ttsConfig.getAudio().getSpeakingRate())
            .setPitch(ttsConfig.getAudio().getPitch())
            .setVolumeGainDb(ttsConfig.getAudio().getVolumeGainDb())
            .build();
        
        // Perform the text-to-speech request
        SynthesizeSpeechResponse response = client.synthesizeSpeech(input, voice, audioConfig);
        
        // Get the audio contents
        ByteString audioContents = response.getAudioContent();
        
        // Write to temporary file
        Path outputPath = Files.createTempFile("narration-natural-", ".mp3");
        Files.write(outputPath, audioContents.toByteArray());
        
        logger.debug("Natural speech synthesized (no pauses): {}", outputPath);
        return outputPath;
    }
    
    /**
     * Escape special XML characters for SSML.
     */
    private String escapeXml(String text) {
        return text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&apos;");
    }
    
    /**
     * Fallback: Generate silent audio using FFmpeg.
     * Duration is estimated based on text length, or uses targetDurationSeconds if provided.
     */
    private Path synthesizeWithFfmpegFallback(NarrationScript script, double targetDurationSeconds) {
        logger.info("Generating fallback silent audio for {} character script", script.text().length());
        
        // Calculate duration
        int durationSeconds;
        if (targetDurationSeconds > 0) {
            durationSeconds = (int) Math.ceil(targetDurationSeconds);
            logger.info("Using target duration: {} seconds", durationSeconds);
        } else {
            // Calculate duration based on text length
            int textLength = script.text().length();
            durationSeconds = Math.max(MIN_DURATION_SECONDS, (int) Math.ceil(textLength / CHARS_PER_SECOND));
            logger.info("Estimated duration from text length: {} seconds", durationSeconds);
        }
        
        try {
            Path outputPath = Files.createTempFile("narration-", ".mp3");
            
            // Generate silent audio using FFmpeg
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
            
            logger.debug("Executing FFmpeg fallback command: {}", String.join(" ", command));
            
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            // Read output
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                    logger.trace("FFmpeg fallback: {}", line);
                }
            }
            
            int exitCode = process.waitFor();
            
            if (exitCode == 0) {
                long fileSize = Files.size(outputPath);
                logger.info("FFmpeg fallback synthesis completed: {} ({} bytes, {} seconds)", 
                    outputPath, fileSize, durationSeconds);
                return outputPath;
            } else {
                logger.error("FFmpeg fallback failed with exit code {}. Output:\n{}", exitCode, output);
                throw new RuntimeException("FFmpeg fallback failed with exit code " + exitCode);
            }
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("FFmpeg fallback process interrupted", e);
            throw new RuntimeException("TTS fallback failed: FFmpeg process interrupted", e);
        } catch (IOException e) {
            logger.error("FFmpeg fallback IO error: {}", e.getMessage(), e);
            throw new RuntimeException("TTS fallback failed: " + e.getMessage() + 
                ". Please install FFmpeg or configure Google Cloud TTS", e);
        }
    }
}
