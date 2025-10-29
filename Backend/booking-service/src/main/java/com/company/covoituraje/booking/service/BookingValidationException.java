package com.company.covoituraje.booking.service;

/**
 * Excepción lanzada cuando las validaciones de booking fallan
 */
public class BookingValidationException extends Exception {
    
    public BookingValidationException(String message) {
        super(message);
    }
    
    public BookingValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
