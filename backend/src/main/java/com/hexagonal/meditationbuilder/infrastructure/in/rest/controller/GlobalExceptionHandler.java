package com.hexagonal.meditationbuilder.infrastructure.in.rest.controller;

import com.hexagonal.meditationbuilder.domain.exception.CompositionNotFoundException;
import com.hexagonal.meditationbuilder.domain.exception.ImageGenerationException;
import com.hexagonal.meditationbuilder.domain.exception.ImageGenerationServiceException;
import com.hexagonal.meditationbuilder.domain.exception.TextGenerationException;
import com.hexagonal.meditationbuilder.domain.exception.TextGenerationServiceException;
import com.hexagonal.meditationbuilder.infrastructure.in.rest.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Clock;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for REST API.
 * 
 * Maps domain and infrastructure exceptions to appropriate HTTP responses
 * following OpenAPI error specification.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private final Clock clock;

    public GlobalExceptionHandler(Clock clock) {
        this.clock = clock;
    }

    // ========== 400 Bad Request ==========

    /**
     * Handles validation errors from @Valid annotations.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        log.warn("Validation error: {}", ex.getMessage());
        
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            fieldErrors.put(error.getField(), error.getDefaultMessage())
        );
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("VALIDATION_ERROR", "Request validation failed", clock.instant(), fieldErrors));
    }

    /**
     * Handles illegal argument exceptions (invalid input).
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Invalid argument: {}", ex.getMessage());
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("INVALID_REQUEST", ex.getMessage(), clock.instant(), null));
    }

    /**
     * Handles illegal state exceptions (e.g., no music selected for preview).
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
        log.warn("Invalid state: {}", ex.getMessage());
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("INVALID_STATE", ex.getMessage(), clock.instant(), null));
    }

    // ========== 404 Not Found ==========

    /**
     * Handles composition not found exceptions.
     */
    @ExceptionHandler(CompositionNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleCompositionNotFound(CompositionNotFoundException ex) {
        log.info("Composition not found: {}", ex.getMessage());
        
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("NOT_FOUND", ex.getMessage(), clock.instant(), null));
    }

    /**
     * Handles music not found exceptions.
     */
    @ExceptionHandler(com.hexagonal.meditationbuilder.domain.exception.MusicNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleMusicNotFound(com.hexagonal.meditationbuilder.domain.exception.MusicNotFoundException ex) {
        log.info("Music not found: {}", ex.getMessage());
        
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("MUSIC_NOT_FOUND", ex.getMessage(), clock.instant(), null));
    }

    // ========== 429 Rate Limit Exceeded ==========

    /**
     * Handles AI service rate limit exceptions (text generation).
     */
    @ExceptionHandler(TextGenerationServiceException.class)
    public ResponseEntity<ErrorResponse> handleTextGenerationServiceError(TextGenerationServiceException ex) {
        if (ex.getMessage() != null && ex.getMessage().toLowerCase().contains("rate limit")) {
            log.warn("Text generation rate limit exceeded");
            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new ErrorResponse("RATE_LIMIT_EXCEEDED", "AI text service rate limit exceeded. Please retry later.", clock.instant(), null));
        }
        
        log.error("Text generation service error: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponse("SERVICE_UNAVAILABLE", "AI text service temporarily unavailable.", clock.instant(), null));
    }

    /**
     * Handles AI service rate limit exceptions (image generation).
     */
    @ExceptionHandler(ImageGenerationServiceException.class)
    public ResponseEntity<ErrorResponse> handleImageGenerationServiceError(ImageGenerationServiceException ex) {
        if (ex.getMessage() != null && ex.getMessage().toLowerCase().contains("rate limit")) {
            log.warn("Image generation rate limit exceeded");
            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new ErrorResponse("RATE_LIMIT_EXCEEDED", "AI image service rate limit exceeded. Please retry later.", clock.instant(), null));
        }
        
        log.error("Image generation service error: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponse("SERVICE_UNAVAILABLE", "AI image service temporarily unavailable.", clock.instant(), null));
    }

    // ========== 503 Service Unavailable ==========

    /**
     * Handles text generation use case exceptions.
     */
    @ExceptionHandler(TextGenerationException.class)
    public ResponseEntity<ErrorResponse> handleTextGenerationError(TextGenerationException ex) {
        log.error("Text generation failed: {}", ex.getMessage());
        
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponse("TEXT_GENERATION_FAILED", "Failed to generate/enhance text. Please retry later.", clock.instant(), null));
    }

    /**
     * Handles image generation use case exceptions.
     */
    @ExceptionHandler(ImageGenerationException.class)
    public ResponseEntity<ErrorResponse> handleImageGenerationError(ImageGenerationException ex) {
        log.error("Image generation failed: {}", ex.getMessage());
        
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponse("IMAGE_GENERATION_FAILED", "Failed to generate image. Please retry later.", clock.instant(), null));
    }

    // ========== 500 Internal Server Error ==========

    /**
     * Handles unexpected exceptions.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericError(Exception ex) {
        log.error("Unexpected error", ex);
        
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred.", clock.instant(), null));
    }
}
