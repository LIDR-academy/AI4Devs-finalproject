package com.hexagonal.meditation.generation.application.service;

import com.hexagonal.meditation.generation.application.validator.TextLengthEstimator;
import com.hexagonal.meditation.generation.domain.enums.MediaType;
import com.hexagonal.meditation.generation.domain.exception.GenerationTimeoutException;
import com.hexagonal.meditation.generation.domain.exception.InvalidContentException;
import com.hexagonal.meditation.generation.domain.model.GeneratedMeditationContent;
import com.hexagonal.meditation.generation.domain.model.MediaReference;
import com.hexagonal.meditation.generation.domain.model.NarrationScript;
import com.hexagonal.meditation.generation.domain.model.SubtitleSegment;
import com.hexagonal.meditation.generation.domain.ports.in.GenerateMeditationContentUseCase;
import com.hexagonal.meditation.generation.domain.ports.in.GenerateMeditationContentUseCase.GenerationRequest;
import com.hexagonal.meditation.generation.domain.ports.in.GenerateMeditationContentUseCase.GenerationResponse;
import com.hexagonal.meditation.generation.domain.ports.out.AudioRenderingPort;
import com.hexagonal.meditation.generation.domain.ports.out.AudioRenderingPort.AudioConfig;
import com.hexagonal.meditation.generation.domain.ports.out.AudioRenderingPort.AudioRenderRequest;
import com.hexagonal.meditation.generation.domain.ports.out.ContentRepositoryPort;
import com.hexagonal.meditation.generation.domain.ports.out.MediaStoragePort;
import com.hexagonal.meditation.generation.domain.ports.out.MediaStoragePort.MediaFileType;
import com.hexagonal.meditation.generation.domain.ports.out.MediaStoragePort.UploadRequest;
import com.hexagonal.meditation.generation.domain.ports.out.SubtitleSyncPort;
import com.hexagonal.meditation.generation.domain.ports.out.VideoRenderingPort;
import com.hexagonal.meditation.generation.domain.ports.out.VideoRenderingPort.VideoConfig;
import com.hexagonal.meditation.generation.domain.ports.out.VideoRenderingPort.VideoRenderRequest;
import com.hexagonal.meditation.generation.domain.ports.out.VoiceSynthesisPort;
import com.hexagonal.meditation.generation.domain.ports.out.VoiceSynthesisPort.VoiceConfig;
import com.hexagonal.meditation.generation.infrastructure.out.service.audio.AudioMetadataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Application service that orchestrates meditation content generation.
 * Implements the hexagonal architecture use case pattern.
 * 
 * Orchestrates the complete generation pipeline:
 * 1. Validate and estimate processing time
 * 2. Check idempotency (avoid duplicate generations)
 * 3. Synthesize voice narration (TTS)
 * 4. Generate synchronized subtitles
 * 5. Render video (if image) or audio (if no image)
 * 6. Upload media and subtitles to S3
 * 7. Persist generation result
 */
public class GenerateMeditationContentService implements GenerateMeditationContentUseCase {
    
    private static final Logger log = LoggerFactory.getLogger(GenerateMeditationContentService.class);
    
    private static final int MAX_GENERATION_TIMEOUT_SECONDS = 187; // 187 seconds per requirement
    private static final long MEDIA_URL_TTL_SECONDS = 3600; // 1 hour for presigned URLs
    
    // Default TTS voice configuration (es-ES meditation voice)
    private static final VoiceConfig DEFAULT_VOICE_CONFIG = new VoiceConfig(
        "es-ES",
        "es-ES-Neural2-Diana",
        0.85,  // Slower speaking rate for meditation
        0.0    // Normal pitch
    );
    
    private final TextLengthEstimator textLengthEstimator;
    private final IdempotencyKeyGenerator idempotencyKeyGenerator;
    private final VoiceSynthesisPort voiceSynthesisPort;
    private final SubtitleSyncPort subtitleSyncPort;
    private final AudioRenderingPort audioRenderingPort;
    private final VideoRenderingPort videoRenderingPort;
    private final MediaStoragePort mediaStoragePort;
    private final ContentRepositoryPort contentRepositoryPort;
    private final AudioMetadataService audioMetadataService;
    private final Clock clock;
    
    public GenerateMeditationContentService(
            TextLengthEstimator textLengthEstimator,
            IdempotencyKeyGenerator idempotencyKeyGenerator,
            VoiceSynthesisPort voiceSynthesisPort,
            SubtitleSyncPort subtitleSyncPort,
            AudioRenderingPort audioRenderingPort,
            VideoRenderingPort videoRenderingPort,
            MediaStoragePort mediaStoragePort,
            ContentRepositoryPort contentRepositoryPort,
            AudioMetadataService audioMetadataService,
            Clock clock) {
        this.textLengthEstimator = textLengthEstimator;
        this.idempotencyKeyGenerator = idempotencyKeyGenerator;
        this.voiceSynthesisPort = voiceSynthesisPort;
        this.subtitleSyncPort = subtitleSyncPort;
        this.audioRenderingPort = audioRenderingPort;
        this.videoRenderingPort = videoRenderingPort;
        this.mediaStoragePort = mediaStoragePort;
        this.contentRepositoryPort = contentRepositoryPort;
        this.audioMetadataService = audioMetadataService;
        this.clock = clock;
    }
    
    @Override
    public GenerationResponse generate(GenerationRequest request) {
        log.info("Starting meditation generation: userId={}, compositionId={}, hasImage={}", 
                request.userId(), request.compositionId(), request.imageReference() != null);
        
        try {
            // 1. Validate input and estimate duration
            // This also throws GenerationTimeoutException if estimated > 187s
            int estimatedDuration = textLengthEstimator.validateAndEstimate(request.narrationText());
            
            // 2. Check idempotency - return existing result if found
            String idempotencyKey = idempotencyKeyGenerator.generate(
                request.userId(),
                request.narrationText(),
                request.musicReference(),
                request.imageReference()
            );
            
            Optional<GeneratedMeditationContent> existing = contentRepositoryPort.findByIdempotencyKey(idempotencyKey);
            if (existing.isPresent()) {
                log.info("Returning cached generation result for idempotencyKey={}", idempotencyKey);
                return mapToResponse(existing.get());
            }
            
            // 3. Create domain aggregate based on media type
            MediaType mediaType = (request.imageReference() != null && !request.imageReference().isBlank()) 
                    ? MediaType.VIDEO : MediaType.AUDIO;
            
            // Explicit validation if imageReference was provided but is blank (e.g. "")
            if (mediaType == MediaType.AUDIO && request.imageReference() != null && request.imageReference().isBlank()) {
                 // The user provided an image field but it's empty - we'll treat this as an error for clarity
                 // instead of silently falling back to audio if they sent a blank string.
                 throw new InvalidContentException("imageReference", "Image reference cannot be blank if provided");
            }

            GeneratedMeditationContent output = createDomainAggregate(request, mediaType, idempotencyKey);
            
            // 4. Save initial state (PROCESSING)
            GeneratedMeditationContent saved = contentRepositoryPort.save(output);
            log.info("Saved initial generation state: meditationId={}, status=PROCESSING", saved.meditationId());
            
            // 5. Execute generation pipeline
            try {
                GeneratedMeditationContent completed = executeGenerationPipeline(saved, request);
                
                // 6. Persist completed state
                GeneratedMeditationContent persisted = contentRepositoryPort.save(completed);
                log.info("Generation completed successfully: meditationId={}, mediaType={}", 
                        persisted.meditationId(), persisted.mediaType());
                
                return mapToResponse(persisted);
                
            } catch (Exception e) {
                log.error("Generation pipeline failed: meditationId={}, error={}", 
                        saved.meditationId(), e.getMessage(), e);
                
                // Mark as failed and persist
                GeneratedMeditationContent failed = saved.markFailed(e.getMessage(), clock);
                contentRepositoryPort.save(failed);
                
                throw new RuntimeException("Generation failed: " + e.getMessage(), e);
            }
            
        } catch (GenerationTimeoutException | InvalidContentException e) {
            // Domain exceptions are re-thrown directly
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during generation: {}", e.getMessage(), e);
            throw new RuntimeException("Generation failed: " + e.getMessage(), e);
        }
    }
    
    /**
     * Execute the complete generation pipeline:
     * - Resolve music and get duration
     * - Synthesize narration voice (TTS) with target duration matching music
     * - Generate synchronized subtitles
     * - Render video or audio
     * - Upload to S3
     * - Mark as completed
     */
    private GeneratedMeditationContent executeGenerationPipeline(
            GeneratedMeditationContent content,
            GenerationRequest request) throws IOException {
        
        UUID meditationId = content.meditationId();
        UUID userId = content.userId();
        
        // Create temp directory for this generation
        Path tempDir = Files.createTempDirectory("meditation-gen-" + meditationId);
        
        try {
            log.info("Starting generation pipeline in temp directory: {}", tempDir);
            
            // Step 1: Resolve music file and get duration
            log.info("Step 1/6: Resolving music file and analyzing duration");
            Path musicPath = resolveMusicPath(request.musicReference(), tempDir);
            
            double musicDuration = 0.0;
            try {
                musicDuration = audioMetadataService.getDurationSeconds(musicPath);
                log.info("Music resolved: {} (duration: {} seconds)", musicPath, musicDuration);
            } catch (Exception e) {
                log.warn("Could not determine music duration: {}", e.getMessage());
                log.info("Music resolved: {}", musicPath);
            }
            
            // Step 2: Synthesize voice narration with pauses distributed across music duration
            log.info("Step 2/6: Synthesizing voice narration");
            Path narrationAudio;
            if (musicDuration > 0) {
                // Synthesize with target duration to match music
                narrationAudio = voiceSynthesisPort.synthesizeVoice(
                    content.narrationScript(),
                    DEFAULT_VOICE_CONFIG,
                    musicDuration
                );
                log.info("Voice synthesis completed with target duration {} seconds: {}", musicDuration, narrationAudio);
                
                // Verify narration duration doesn't exceed music duration
                try {
                    double narrationDuration = audioMetadataService.getDurationSeconds(narrationAudio);
                    log.info("Narration actual duration: {} seconds (music: {} seconds)", narrationDuration, musicDuration);
                    
                    if (narrationDuration > musicDuration + 0.5) { // Allow 0.5s tolerance
                        log.warn("Narration duration ({} s) exceeds music duration ({} s). Truncating narration to match music.", 
                            narrationDuration, musicDuration);
                        narrationAudio = truncateAudio(narrationAudio, musicDuration, tempDir);
                        log.info("Narration truncated to {} seconds", musicDuration);
                    }
                } catch (Exception e) {
                    log.warn("Could not verify narration duration: {}", e.getMessage());
                }
            } else {
                // Synthesize with natural duration
                narrationAudio = voiceSynthesisPort.synthesizeVoice(
                    content.narrationScript(),
                    DEFAULT_VOICE_CONFIG
                );
                log.info("Voice synthesis completed with natural duration: {}", narrationAudio);
            }
            
            // Step 3: Generate synchronized subtitles distributed across music duration
            log.info("Step 3/6: Generating synchronized subtitles");
            List<SubtitleSegment> subtitleSegments;
            if (musicDuration > 0) {
                // Distribute subtitles across entire music duration
                subtitleSegments = subtitleSyncPort.generateSubtitles(
                    request.narrationText(),
                    musicDuration
                );
            } else {
                // Use narration audio duration
                subtitleSegments = subtitleSyncPort.generateSubtitles(
                    narrationAudio,
                    request.narrationText()
                );
            }
            
            Path subtitleFile = tempDir.resolve(meditationId + ".srt");
            Path finalSubtitleFile = subtitleSyncPort.exportToSrt(subtitleSegments, subtitleFile);
            log.info("Subtitles generated: {} segments, file: {}", subtitleSegments.size(), finalSubtitleFile);
            
            // Step 4: Render video or audio
            log.info("Step 4/6: Rendering {} output", content.mediaType());
            Path outputMedia;
            MediaFileType mediaFileType;
            
            if (content.mediaType() == MediaType.VIDEO) {
                // Download or resolve image
                Path imagePath = resolveImagePath(request.imageReference(), tempDir);
                
                // Render video
                Path videoOutput = tempDir.resolve(meditationId + ".mp4");
                VideoRenderRequest videoRequest = new VideoRenderRequest(
                    narrationAudio,
                    musicPath,
                    imagePath,
                    finalSubtitleFile,
                    videoOutput,
                    VideoConfig.hdMeditationVideo()
                );
                outputMedia = videoRenderingPort.renderVideo(videoRequest);
                mediaFileType = MediaFileType.VIDEO;
                log.info("Video rendering completed: {}", outputMedia);
                
            } else {
                // Render audio
                Path audioOutput = tempDir.resolve(meditationId + ".mp3");
                
                // Log music path before creating request
                log.info("Creating audio render request with music: {}", musicPath);
                if (musicPath != null && Files.exists(musicPath)) {
                    log.info("Music file confirmed exists: {} (size: {} bytes)", musicPath, Files.size(musicPath));
                } else {
                    log.warn("Music file is null or does not exist: {}", musicPath);
                }
                
                AudioRenderRequest audioRequest = new AudioRenderRequest(
                    narrationAudio,
                    musicPath,
                    audioOutput,
                    AudioConfig.meditationAudio()
                );
                outputMedia = audioRenderingPort.renderAudio(audioRequest);
                mediaFileType = MediaFileType.AUDIO;
                log.info("Audio rendering completed: {}", outputMedia);
            }
            
            // Step 5: Upload to S3
            log.info("Step 5/6: Uploading media to S3");
            
            // Capture real duration before uploading and deleting local file
            double realDurationSeconds = 0;
            try {
                realDurationSeconds = audioMetadataService.getDurationSeconds(outputMedia);
                log.info("Captured real output duration: {}s", realDurationSeconds);
            } catch (Exception e) {
                log.warn("Failed to capture real duration from local file {}: {}", outputMedia, e.getMessage());
            }

            String mediaUrl = mediaStoragePort.uploadMedia(new UploadRequest(
                outputMedia,
                userId.toString(),
                meditationId,
                mediaFileType,
                MEDIA_URL_TTL_SECONDS
            ));
            log.info("Media uploaded: {}", mediaUrl);
            
            log.info("Step 6/6: Uploading subtitles to S3");
            String subtitleUrl = mediaStoragePort.uploadMedia(new UploadRequest(
                finalSubtitleFile,
                userId.toString(),
                meditationId,
                MediaFileType.SUBTITLE,
                MEDIA_URL_TTL_SECONDS
            ));
            log.info("Subtitles uploaded: {}", subtitleUrl);
            
            // Create media references
            MediaReference mediaRef = new MediaReference(mediaUrl);
            MediaReference subtitleRef = new MediaReference(subtitleUrl);
            
            // Mark as completed
            Integer finalDurationSeconds = realDurationSeconds > 0 ? (int) Math.round(realDurationSeconds) : null;
            GeneratedMeditationContent completed = content.markCompleted(mediaRef, subtitleRef, finalDurationSeconds, clock);
            log.info("Generation pipeline completed successfully. Real duration: {}s", finalDurationSeconds);
            
            return completed;
            
        } finally {
            // Cleanup temp directory
            cleanupTempDirectory(tempDir);
        }
    }
    
    /**
     * Resolve music path from reference.
     * Supports: file paths, HTTP/HTTPS URLs.
     * Rejects: blob URLs (browser-only).
     */
    private Path resolveMusicPath(String musicReference, Path tempDir) throws IOException {
        if (musicReference == null || musicReference.isBlank()) {
            throw new InvalidContentException("musicReference", "Music reference cannot be null or blank");
        }
        
        // Reject blob URLs (browser-only, not accessible from backend)
        if (musicReference.startsWith("blob:")) {
            throw new InvalidContentException("musicReference", 
                "Blob URLs are not supported. Please upload the music file to S3 or provide an HTTP/HTTPS URL.");
        }
        
        // Handle HTTP/HTTPS URLs - download to temp directory
        if (musicReference.startsWith("http://") || musicReference.startsWith("https://")) {
            log.info("Downloading music from URL: {}", musicReference);
            return downloadFile(musicReference, tempDir, "music.mp3");
        }
        
        // Handle file paths
        try {
            Path musicPath = Path.of(musicReference);
            if (Files.exists(musicPath)) {
                log.info("Using local music file: {}", musicPath);
                return musicPath;
            }
        } catch (Exception e) {
            log.warn("Invalid file path for music: {}", musicReference, e);
        }
        
        throw new InvalidContentException("musicReference", 
            "Music file not found. Provide a valid file path or HTTP/HTTPS URL: " + musicReference);
    }
    
    /**
     * Resolve image path from reference.
     * Supports: file paths, HTTP/HTTPS URLs, base64 data URIs.
     * Rejects: blob URLs (browser-only).
     */
    private Path resolveImagePath(String imageReference, Path tempDir) throws IOException {
        if (imageReference == null || imageReference.isBlank()) {
            throw new InvalidContentException("imageReference", "Image reference cannot be null or blank");
        }
        
        // Reject blob URLs (browser-only, not accessible from backend)
        if (imageReference.startsWith("blob:")) {
            throw new InvalidContentException("imageReference", 
                "Blob URLs are not supported. Please upload the image file to S3 or provide an HTTP/HTTPS URL.");
        }
        
        // Handle base64 data URIs (e.g., data:image/png;base64,iVBORw0KG...)
        if (imageReference.startsWith("data:image/")) {
            log.info("Decoding base64 image data URI (length: {})", imageReference.length());
            return decodeBase64Image(imageReference, tempDir);
        }
        
        // Handle HTTP/HTTPS URLs - download to temp directory
        if (imageReference.startsWith("http://") || imageReference.startsWith("https://")) {
            log.info("Downloading image from URL: {}", imageReference);
            return downloadFile(imageReference, tempDir, "image.jpg");
        }
        
        // Handle file paths
        try {
            Path imagePath = Path.of(imageReference);
            if (Files.exists(imagePath)) {
                log.info("Using local image file: {}", imagePath);
                return imagePath;
            }
        } catch (Exception e) {
            log.warn("Invalid file path for image: {}", imageReference, e);
        }
        
        throw new InvalidContentException("imageReference", 
            "Image file not found. Provide a valid file path, HTTP/HTTPS URL, or base64 data URI: " + imageReference);
    }
    
    /**
     * Download a file from an HTTP/HTTPS URL to the temp directory.
     */
    private Path downloadFile(String url, Path tempDir, String defaultFilename) throws IOException {
        try {
            java.net.URL fileUrl = new java.net.URL(url);
            String filename = extractFilenameFromUrl(url, defaultFilename);
            Path targetPath = tempDir.resolve(filename);
            
            log.info("Downloading file from {} to {}", url, targetPath);
            
            try (java.io.InputStream in = fileUrl.openStream()) {
                Files.copy(in, targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }
            
            log.info("File downloaded successfully: {} ({} bytes)", targetPath, Files.size(targetPath));
            return targetPath;
            
        } catch (java.net.MalformedURLException e) {
            throw new InvalidContentException("url", "Invalid URL format: " + url);
        } catch (IOException e) {
            throw new RuntimeException("Failed to download file from " + url + ": " + e.getMessage(), e);
        }
    }
    
    /**
     * Extract filename from URL path, or use default if not found.
     */
    private String extractFilenameFromUrl(String url, String defaultFilename) {
        try {
            String path = new java.net.URL(url).getPath();
            int lastSlash = path.lastIndexOf('/');
            if (lastSlash >= 0 && lastSlash < path.length() - 1) {
                String filename = path.substring(lastSlash + 1);
                if (!filename.isBlank()) {
                    return filename;
                }
            }
        } catch (Exception e) {
            log.warn("Failed to extract filename from URL: {}", url, e);
        }
        return defaultFilename;
    }
    
    /**
     * Decode base64 data URI to image file.
     * Format: data:image/<format>;base64,<base64-encoded-data>
     */
    private Path decodeBase64Image(String dataUri, Path tempDir) throws IOException {
        try {
            // Extract MIME type and base64 data
            if (!dataUri.contains(",")) {
                throw new InvalidContentException("imageReference", "Invalid base64 data URI format: missing comma separator");
            }
            
            String[] parts = dataUri.split(",", 2);
            String header = parts[0]; // data:image/<format>;base64
            String base64Data = parts[1];
            
            // Extract image format (png, jpeg, etc.)
            String format = "png"; // default
            if (header.contains("image/")) {
                int start = header.indexOf("image/") + 6;
                int end = header.indexOf(";", start);
                if (end > start) {
                    format = header.substring(start, end);
                }
            }
            
            // Decode base64 to bytes
            byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Data);
            
            // Write to temp file
            Path imagePath = tempDir.resolve("image." + format);
            Files.write(imagePath, imageBytes);
            
            log.info("Base64 image decoded successfully: {} ({} bytes)", imagePath, imageBytes.length);
            return imagePath;
            
        } catch (IllegalArgumentException e) {
            throw new InvalidContentException("imageReference", "Invalid base64 encoding: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Failed to decode base64 image: " + e.getMessage(), e);
        }
    }
    
    /**
     * Sanitize image reference for database storage.
     * Replaces base64 data URIs with a short descriptor to avoid DB length limits.
     */
    private String sanitizeImageReference(String imageReference) {
        if (imageReference == null || imageReference.isBlank()) {
            return imageReference;
        }
        
        // If it's a base64 data URI, replace with descriptor
        if (imageReference.startsWith("data:image/")) {
            // Extract format if possible
            String format = "image";
            int formatStart = imageReference.indexOf("image/") + 6;
            int formatEnd = imageReference.indexOf(";", formatStart);
            if (formatEnd > formatStart && formatEnd < formatStart + 10) {
                format = imageReference.substring(formatStart, formatEnd);
            }
            return "data:image/" + format + ";base64" + " (generated)";
        }
        
        // For URLs and paths, return as-is (already short)
        return imageReference;
    }
    
    /**
     * Sanitize music reference for database storage.
     * Ensures reference doesn't exceed DB length limits.
     */
    private String sanitizeMusicReference(String musicReference) {
        if (musicReference == null || musicReference.isBlank()) {
            return musicReference;
        }
        
        // For now, just truncate if too long
        if (musicReference.length() > 450) {
            return musicReference.substring(0, 447) + "...";
        }
        
        return musicReference;
    }
    
    /**
     * Truncate audio file to specified duration using FFmpeg.
     * This ensures narration doesn't exceed music duration.
     */
    private Path truncateAudio(Path inputAudio, double maxDurationSeconds, Path tempDir) throws IOException {
        Path outputPath = tempDir.resolve("narration-truncated.mp3");
        
        List<String> command = new ArrayList<>();
        command.add("ffmpeg");
        command.add("-y");
        command.add("-i");
        command.add(inputAudio.toAbsolutePath().toString());
        command.add("-t");
        command.add(String.format("%.2f", maxDurationSeconds));
        command.add("-c");
        command.add("copy");
        command.add(outputPath.toAbsolutePath().toString());
        
        try {
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            // Read output
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
            
            int exitCode = process.waitFor();
            
            if (exitCode == 0) {
                // Delete original and return truncated version
                Files.deleteIfExists(inputAudio);
                return outputPath;
            } else {
                log.error("FFmpeg truncation failed with exit code {}. Output:\n{}", exitCode, output);
                // Return original if truncation fails
                return inputAudio;
            }
            
        } catch (Exception e) {
            log.error("Failed to truncate audio: {}", e.getMessage(), e);
            // Return original if truncation fails
            return inputAudio;
        }
    }
    
    /**
     * Cleanup temporary directory and all files.
     */
    private void cleanupTempDirectory(Path tempDir) {
        try {
            if (Files.exists(tempDir)) {
                Files.walk(tempDir)
                    .sorted((a, b) -> b.compareTo(a)) // Delete files before directories
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException e) {
                            log.warn("Failed to delete temp file: {}", path, e);
                        }
                    });
                log.info("Temp directory cleaned up: {}", tempDir);
            }
        } catch (IOException e) {
            log.warn("Failed to cleanup temp directory: {}", tempDir, e);
        }
    }
    
    /**
     * Creates the domain aggregate for the meditation output.
     * Validates that video requests include an image reference.
     */
    private GeneratedMeditationContent createDomainAggregate(
            GenerationRequest request,
            MediaType mediaType,
            String idempotencyKey) {
        
        NarrationScript narrationScript = new NarrationScript(request.narrationText());
        UUID meditationId = UUID.randomUUID();
        
        if (mediaType == MediaType.VIDEO) {
            if (request.imageReference() == null || request.imageReference().isBlank()) {
                throw new InvalidContentException("imageReference", "Image reference required for video generation");
            }
            
            // Sanitize image reference to avoid DB length issues with base64
            String sanitizedImageRef = sanitizeImageReference(request.imageReference());
            MediaReference imageMediaReference = new MediaReference(sanitizedImageRef);
            
            return GeneratedMeditationContent.createVideo(
                meditationId,
                request.compositionId(),
                request.userId(),
                idempotencyKey,
                narrationScript,
                imageMediaReference,
                clock
            );
        } else {
            return GeneratedMeditationContent.createAudio(
                meditationId,
                request.compositionId(),
                request.userId(),
                idempotencyKey,
                narrationScript,
                clock
            );
        }
    }
    
    /**
     * Maps domain aggregate to response DTO.
     */
    private GenerationResponse mapToResponse(GeneratedMeditationContent content) {
        log.info("Mapping to response: meditationId={}, status={}, duration={}", 
            content.meditationId(), content.status(), content.durationSeconds());
            
        return new GenerationResponse(
            content.meditationId(),
            content.compositionId(),
            content.userId(),
            content.status(),
            content.mediaType(),
            content.outputMedia() != null ? content.outputMedia().url() : null,
            content.subtitleFile() != null ? content.subtitleFile().url() : null,
            content.durationSeconds() != null ? content.durationSeconds() : (int) content.narrationScript().estimateDurationSeconds(),
            content.createdAt(),
            content.completedAt()
        );
    }
}
