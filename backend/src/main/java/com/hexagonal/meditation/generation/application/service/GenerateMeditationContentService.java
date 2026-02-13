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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.time.Instant;
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
    
    private static final int MAX_GENERATION_TIMEOUT_SECONDS = 180; // 3 minutes
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
            Clock clock) {
        this.textLengthEstimator = textLengthEstimator;
        this.idempotencyKeyGenerator = idempotencyKeyGenerator;
        this.voiceSynthesisPort = voiceSynthesisPort;
        this.subtitleSyncPort = subtitleSyncPort;
        this.audioRenderingPort = audioRenderingPort;
        this.videoRenderingPort = videoRenderingPort;
        this.mediaStoragePort = mediaStoragePort;
        this.contentRepositoryPort = contentRepositoryPort;
        this.clock = clock;
    }
    
    @Override
    public GenerationResponse generate(GenerationRequest request) {
        log.info("Starting meditation generation: userId={}, compositionId={}, hasImage={}", 
                request.userId(), request.compositionId(), request.imageReference() != null);
        
        try {
            // 1. Validate input and estimate duration
            int estimatedDuration = textLengthEstimator.validateAndEstimate(request.narrationText());
            
            if (estimatedDuration > MAX_GENERATION_TIMEOUT_SECONDS) {
                throw new GenerationTimeoutException(estimatedDuration, MAX_GENERATION_TIMEOUT_SECONDS);
            }
            
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
            MediaType mediaType = request.imageReference() != null && !request.imageReference().isBlank() 
                    ? MediaType.VIDEO : MediaType.AUDIO;
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
     * - Synthesize narration voice (TTS)
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
            
            // Step 1: Synthesize voice narration
            log.info("Step 1/5: Synthesizing voice narration");
            Path narrationAudio = voiceSynthesisPort.synthesizeVoice(
                content.narrationScript(),
                DEFAULT_VOICE_CONFIG
            );
            log.info("Voice synthesis completed: {}", narrationAudio);
            
            // Step 2: Generate synchronized subtitles
            log.info("Step 2/5: Generating synchronized subtitles");
            List<SubtitleSegment> subtitleSegments = subtitleSyncPort.generateSubtitles(
                narrationAudio,
                request.narrationText()
            );
            
            Path subtitleFile = tempDir.resolve(meditationId + ".srt");
            Path finalSubtitleFile = subtitleSyncPort.exportToSrt(subtitleSegments, subtitleFile);
            log.info("Subtitles generated: {} segments, file: {}", subtitleSegments.size(), finalSubtitleFile);
            
            // Step 3: Download music file (assuming musicReference is a URL or path)
            // For MVP, we assume musicReference is already a valid path to the music file
            Path musicPath = resolveMusicPath(request.musicReference(), tempDir);
            log.info("Music resolved: {}", musicPath);
            
            // Step 4: Render video or audio
            log.info("Step 3/5: Rendering {} output", content.mediaType());
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
            log.info("Step 4/5: Uploading media to S3");
            String mediaUrl = mediaStoragePort.uploadMedia(new UploadRequest(
                outputMedia,
                userId.toString(),
                meditationId,
                mediaFileType,
                MEDIA_URL_TTL_SECONDS
            ));
            log.info("Media uploaded: {}", mediaUrl);
            
            log.info("Step 5/5: Uploading subtitles to S3");
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
            GeneratedMeditationContent completed = content.markCompleted(mediaRef, subtitleRef, clock);
            log.info("Generation pipeline completed successfully");
            
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
     * Supports: file paths, HTTP/HTTPS URLs.
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
            "Image file not found. Provide a valid file path or HTTP/HTTPS URL: " + imageReference);
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
            
            MediaReference imageMediaReference = new MediaReference(request.imageReference());
            
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
        return new GenerationResponse(
            content.meditationId(),
            content.compositionId(),
            content.userId(),
            content.status(),
            content.mediaType(),
            content.outputMedia().map(MediaReference::url),
            content.subtitleFile().map(MediaReference::url),
            Optional.of((int) content.narrationScript().estimateDurationSeconds()),
            content.createdAt(),
            content.completedAt()
        );
    }
}
