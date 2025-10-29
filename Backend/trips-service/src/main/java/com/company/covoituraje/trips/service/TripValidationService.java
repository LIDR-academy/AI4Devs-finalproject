package com.company.covoituraje.trips.service;

import com.company.covoituraje.trips.domain.Trip;
import com.company.covoituraje.trips.api.TripCreateDto;
import com.company.covoituraje.trips.integration.BookingServiceClient;
import com.company.covoituraje.shared.i18n.MessageService;
import com.company.covoituraje.shared.i18n.LocaleUtils;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

public class TripValidationService {
    
    private final BookingServiceClient bookingServiceClient;
    private final MessageService messageService;
    
    // Regex pattern for sede ID validation
    private static final Pattern SEDE_ID_PATTERN = Pattern.compile("^SEDE-[1-3]$");
    
    // Constants for validation
    private static final double MIN_LATITUDE = -90.0;
    private static final double MAX_LATITUDE = 90.0;
    private static final double MIN_LONGITUDE = -180.0;
    private static final double MAX_LONGITUDE = 180.0;
    private static final int MIN_SEATS = 1;
    private static final int MAX_SEATS = 8;
    
    public TripValidationService() {
        this.bookingServiceClient = new BookingServiceClient();
        this.messageService = new MessageService();
    }
    
    public TripValidationService(BookingServiceClient bookingServiceClient, MessageService messageService) {
        this.bookingServiceClient = bookingServiceClient;
        this.messageService = messageService;
    }
    
    /**
     * Validates a trip creation request
     */
    public List<String> validateTripCreation(TripCreateDto createDto, String acceptLanguage) {
        List<String> errors = new ArrayList<>();
        Locale locale = LocaleUtils.parseAcceptLanguage(acceptLanguage);
        
        // Validate coordinates
        if (createDto.origin != null) {
            validateCoordinates(createDto.origin.lat, createDto.origin.lng, errors, locale);
        } else {
            errors.add(messageService.getMessage("trips.validation.origin_required", locale));
        }
        
        // Validate destination sede
        validateDestinationSede(createDto.destinationSedeId, errors, locale);
        
        // Validate date time
        validateDateTime(createDto.dateTime, errors, locale);
        
        // Validate seats
        validateSeats(createDto.seatsTotal, errors, locale);
        
        // Validate direction
        validateDirection(createDto.direction, errors, locale);
        
        return errors;
    }
    
    /**
     * Validates a trip update request
     */
    public List<String> validateTripUpdate(TripCreateDto updateDto, Trip existingTrip, String acceptLanguage) {
        List<String> errors = new ArrayList<>();
        Locale locale = LocaleUtils.parseAcceptLanguage(acceptLanguage);
        
        // Validate coordinates if provided
        if (updateDto.origin != null) {
            validateCoordinates(updateDto.origin.lat, updateDto.origin.lng, errors, locale);
        }
        
        // Validate destination sede if provided
        if (updateDto.destinationSedeId != null && !updateDto.destinationSedeId.isBlank()) {
            validateDestinationSede(updateDto.destinationSedeId, errors, locale);
        }
        
        // Validate date time if provided
        if (updateDto.dateTime != null && !updateDto.dateTime.isBlank()) {
            validateDateTime(updateDto.dateTime, errors, locale);
        }
        
        // Validate seats if provided
        if (updateDto.seatsTotal > 0) {
            validateSeats(updateDto.seatsTotal, errors, locale);
            
            // Check if reducing seats would conflict with existing bookings
            if (updateDto.seatsTotal < existingTrip.getSeatsTotal()) {
                int currentlyOccupied = existingTrip.getSeatsTotal() - existingTrip.getSeatsFree();
                if (updateDto.seatsTotal < currentlyOccupied) {
                    errors.add(messageService.getMessage("trips.validation.cannot_reduce_seats_below_booked", locale));
                }
            }
        }
        
        // Validate direction if provided
        if (updateDto.direction != null && !updateDto.direction.isBlank()) {
            validateDirection(updateDto.direction, errors, locale);
        }
        
        return errors;
    }
    
    /**
     * Validates if a trip can be deleted (no confirmed bookings)
     */
    public List<String> validateTripDeletion(Trip trip, String acceptLanguage) {
        List<String> errors = new ArrayList<>();
        Locale locale = LocaleUtils.parseAcceptLanguage(acceptLanguage);
        
        try {
            // Check if trip has confirmed bookings
            boolean hasConfirmedBookings = bookingServiceClient.hasConfirmedBookings(trip.getId().toString());
            if (hasConfirmedBookings) {
                errors.add(messageService.getMessage("trips.validation.cannot_delete_with_confirmed_bookings", locale));
            }
        } catch (Exception e) {
            // If we can't check bookings, allow deletion but log the issue
            // In production, you might want to be more strict here
            System.err.println("Warning: Could not verify bookings for trip " + trip.getId() + ": " + e.getMessage());
        }
        
        return errors;
    }
    
    private void validateCoordinates(Double lat, Double lng, List<String> errors, Locale locale) {
        if (lat == null || lng == null) {
            errors.add(messageService.getMessage("trips.validation.coordinates_required", locale));
            return;
        }
        
        if (lat < MIN_LATITUDE || lat > MAX_LATITUDE) {
            errors.add(messageService.getMessage("trips.validation.latitude_range", locale));
        }
        
        if (lng < MIN_LONGITUDE || lng > MAX_LONGITUDE) {
            errors.add(messageService.getMessage("trips.validation.longitude_range", locale));
        }
    }
    
    private void validateDestinationSede(String destinationSedeId, List<String> errors, Locale locale) {
        if (destinationSedeId == null || destinationSedeId.isBlank()) {
            errors.add(messageService.getMessage("trips.validation.destination_required", locale));
            return;
        }
        
        if (!SEDE_ID_PATTERN.matcher(destinationSedeId).matches()) {
            errors.add(messageService.getMessage("trips.validation.destination_format", locale));
        }
    }
    
    private void validateDateTime(String dateTime, List<String> errors, Locale locale) {
        if (dateTime == null || dateTime.isBlank()) {
            errors.add(messageService.getMessage("trips.validation.datetime_required", locale));
            return;
        }
        
        try {
            OffsetDateTime parsedDateTime = OffsetDateTime.parse(dateTime);
            OffsetDateTime now = OffsetDateTime.now();
            
            if (parsedDateTime.isBefore(now)) {
                errors.add(messageService.getMessage("trips.validation.datetime_future", locale));
            }
        } catch (Exception e) {
            errors.add(messageService.getMessage("trips.validation.datetime_format", locale));
        }
    }
    
    private void validateSeats(Integer seatsTotal, List<String> errors, Locale locale) {
        if (seatsTotal == null) {
            errors.add(messageService.getMessage("trips.validation.seats_required", locale));
            return;
        }
        
        if (seatsTotal < MIN_SEATS || seatsTotal > MAX_SEATS) {
            errors.add(messageService.getMessage("trips.validation.seats_range", locale));
        }
    }
    
    private void validateDirection(String direction, List<String> errors, Locale locale) {
        if (direction == null || direction.isBlank()) {
            return; // Direction is optional, will default to TO_SEDE
        }
        
        try {
            Trip.Direction.valueOf(direction);
        } catch (IllegalArgumentException e) {
            errors.add(messageService.getMessage("trips.validation.direction_invalid", locale));
        }
    }
}
