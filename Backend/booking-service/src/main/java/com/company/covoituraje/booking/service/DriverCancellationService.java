package com.company.covoituraje.booking.service;

import java.time.OffsetDateTime;

/**
 * Service to handle driver cancellation rules with configurable cutoff time.
 * 
 * Business Rules:
 * - Driver cannot cancel within configurable cutoff time (default 2 hours)
 * - Passenger can cancel anytime
 * - Cutoff time configurable via DRIVER_CANCEL_CUTOFF_HOURS environment variable
 */
public class DriverCancellationService {
    
    private static final int DEFAULT_CUTOFF_HOURS = 2;
    
    /**
     * Check if a driver can cancel a trip based on cutoff time rules
     * 
     * @param driverId The driver ID
     * @param tripId The trip ID
     * @param tripDateTime The scheduled trip date/time
     * @return true if driver can cancel, false otherwise
     */
    public boolean canDriverCancel(String driverId, String tripId, OffsetDateTime tripDateTime) {
        int cutoffHours = getCutoffHours();
        OffsetDateTime cutoffTime = OffsetDateTime.now().plusHours(cutoffHours);
        
        return tripDateTime.isAfter(cutoffTime);
    }
    
    /**
     * Check if a passenger can cancel a booking
     * Passengers can always cancel (no time restrictions)
     * 
     * @param passengerId The passenger ID
     * @param bookingId The booking ID
     * @param tripDateTime The scheduled trip date/time
     * @return true (passengers can always cancel)
     */
    public boolean canPassengerCancel(String passengerId, String bookingId, OffsetDateTime tripDateTime) {
        return true; // Passengers can always cancel
    }
    
    /**
     * Validate driver cancellation with business rules
     * 
     * @param driverId The driver ID
     * @param tripId The trip ID
     * @param tripDateTime The scheduled trip date/time
     * @throws BookingValidationException if driver cannot cancel
     */
    public void validateDriverCancellation(String driverId, String tripId, OffsetDateTime tripDateTime) 
            throws BookingValidationException {
        if (!canDriverCancel(driverId, tripId, tripDateTime)) {
            int cutoffHours = getCutoffHours();
            throw new BookingValidationException(
                String.format("Driver cannot cancel trip within %d hours of departure time", cutoffHours)
            );
        }
    }
    
    /**
     * Validate passenger cancellation (always allowed)
     * 
     * @param passengerId The passenger ID
     * @param bookingId The booking ID
     * @param tripDateTime The scheduled trip date/time
     * @throws BookingValidationException never (passengers can always cancel)
     */
    public void validatePassengerCancellation(String passengerId, String bookingId, OffsetDateTime tripDateTime) 
            throws BookingValidationException {
        // Passengers can always cancel - no validation needed
    }
    
    /**
     * Get the configured cutoff hours for driver cancellations
     * 
     * @return cutoff hours (default 2)
     */
    public int getCutoffHours() {
        String cutoffStr = System.getProperty("DRIVER_CANCEL_CUTOFF_HOURS");
        if (cutoffStr == null || cutoffStr.trim().isEmpty()) {
            return DEFAULT_CUTOFF_HOURS;
        }
        
        try {
            int cutoff = Integer.parseInt(cutoffStr.trim());
            return cutoff > 0 ? cutoff : DEFAULT_CUTOFF_HOURS;
        } catch (NumberFormatException e) {
            return DEFAULT_CUTOFF_HOURS;
        }
    }
}
