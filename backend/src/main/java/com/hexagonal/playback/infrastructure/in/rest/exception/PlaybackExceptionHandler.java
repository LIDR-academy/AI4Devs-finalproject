package com.hexagonal.playback.infrastructure.in.rest.exception;

import com.hexagonal.playback.domain.exception.MeditationNotFoundException;
import com.hexagonal.playback.domain.exception.MeditationNotPlayableException;
import com.hexagonal.playback.infrastructure.in.rest.dto.ErrorResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Clock;
import java.time.Instant;

/**
 * Global exception handler for Playback BC REST controllers.
 * 
 * Maps domain exceptions to HTTP responses:
 * - MeditationNotFoundException → 404 Not Found
 * - MeditationNotPlayableException → 409 Conflict
 * 
 * Error Response Format (as per OpenAPI ErrorResponse schema):
 * - message: User-friendly error message (Spanish)
 * - timestamp: Error occurrence timestamp
 * - details: Additional context (optional)
 */
@RestControllerAdvice
public class PlaybackExceptionHandler {

    private final Clock clock;

    public PlaybackExceptionHandler(Clock clock) {
        this.clock = clock;
    }

    /**
     * Handles MeditationNotFoundException.
     * 
     * Scenarios:
     * - Meditation doesn't exist
     * - Meditation belongs to different user
     * 
     * HTTP Response: 404 Not Found
     * 
     * @param ex Domain exception
     * @return 404 error response
     */
    @ExceptionHandler(MeditationNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleMeditationNotFound(MeditationNotFoundException ex) {
        ErrorResponseDto error = new ErrorResponseDto(
            "Meditación no encontrada",
            Instant.now(clock),
            null
        );
        
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(error);
    }

    /**
     * Handles MeditationNotPlayableException.
     * 
     * Scenarios:
     * - Meditation state: PENDING → "En cola para ser generada"
     * - Meditation state: PROCESSING → "Aún se está procesando. Espera a que esté lista."
     * - Meditation state: FAILED → "Error al generar. Inténtalo de nuevo."
     * 
     * HTTP Response: 409 Conflict
     * 
     * @param ex Domain exception
     * @return 409 error response with state-specific Spanish message
     */
    @ExceptionHandler(MeditationNotPlayableException.class)
    public ResponseEntity<ErrorResponseDto> handleMeditationNotPlayable(MeditationNotPlayableException ex) {
        ErrorResponseDto error = new ErrorResponseDto(
            ex.getUserMessage(), // Spanish user-friendly message from domain exception
            Instant.now(clock),
            "Current state: " + ex.getCurrentState().getLabel()
        );
        
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(error);
    }
}
