package com.company.covoituraje.booking.api;

import com.company.covoituraje.booking.domain.Booking;
import com.company.covoituraje.booking.infrastructure.BookingRepository;
import com.company.covoituraje.booking.service.BookingValidationService;
import com.company.covoituraje.booking.integration.NotificationServiceClient;
import com.company.covoituraje.booking.service.BookingValidationException;
import com.company.covoituraje.booking.integration.TripsServiceClient;
import com.company.covoituraje.booking.integration.UsersServiceClient;
import com.company.covoituraje.shared.i18n.MessageService;
import com.company.covoituraje.shared.i18n.LocaleUtils;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Path("/bookings")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class BookingResource {

    private final BookingRepository repository;
    private final BookingValidationService validationService;
    private final NotificationServiceClient notificationClient;
    private final MessageService messageService;
    
    static final class AuthContext {
        private static final ThreadLocal<String> USER_ID = new ThreadLocal<>();
        static void setUserId(String userId) { USER_ID.set(userId); }
        static String getUserId() { return USER_ID.get(); }
        static void clear() { USER_ID.remove(); }
    }
    
    public BookingResource() {
        this.repository = new BookingRepository();
        String tripsServiceUrl = System.getenv("TRIPS_SERVICE_URL");
        if (tripsServiceUrl == null || tripsServiceUrl.isBlank()) {
            tripsServiceUrl = "http://localhost:8081";
        }
        String usersServiceUrl = System.getenv("USERS_SERVICE_URL");
        if (usersServiceUrl == null || usersServiceUrl.isBlank()) {
            usersServiceUrl = "http://localhost:8082";
        }
        TripsServiceClient tripsServiceClient = new TripsServiceClient(tripsServiceUrl);
        UsersServiceClient usersServiceClient = new UsersServiceClient(usersServiceUrl);
        this.validationService = new BookingValidationService(tripsServiceClient, usersServiceClient);
        String notificationServiceUrl = System.getenv().getOrDefault("NOTIFICATION_SERVICE_URL", "http://localhost:8085/api");
        this.notificationClient = new NotificationServiceClient(notificationServiceUrl);
        this.messageService = new MessageService();
    }

    public BookingResource(BookingRepository repository, BookingValidationService validationService, NotificationServiceClient notificationClient) {
        this.repository = repository;
        this.validationService = validationService;
        this.notificationClient = notificationClient;
        this.messageService = new MessageService();
    }

    public BookingResource(BookingRepository repository, BookingValidationService validationService) {
        this.repository = repository;
        this.validationService = validationService;
        String notificationServiceUrl = System.getenv().getOrDefault("NOTIFICATION_SERVICE_URL", "http://localhost:8085/api");
        this.notificationClient = new NotificationServiceClient(notificationServiceUrl);
        this.messageService = new MessageService();
    }

    public BookingResource(BookingRepository repository, BookingValidationService validationService, NotificationServiceClient notificationClient, MessageService messageService) {
        this.repository = repository;
        this.validationService = validationService;
        this.notificationClient = notificationClient;
        this.messageService = messageService;
    }

    @POST
    public BookingDto create(BookingCreateDto request, @HeaderParam("Accept-Language") String acceptLanguage) {
        String currentUser = AuthContext.getUserId();
        if (currentUser == null || currentUser.isBlank()) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.user_id_required", locale);
            throw new BadRequestException(message);
        }

        // Validate request
        if (request.tripId == null || request.tripId.isBlank()) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.trip_id_required", locale);
            throw new BadRequestException(message);
        }
        if (request.seatsRequested == null || request.seatsRequested <= 0) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.valid_seats_required", locale);
            throw new BadRequestException(message);
        }

        // Parse tripId
        UUID tripId;
        try {
            tripId = UUID.fromString(request.tripId);
        } catch (IllegalArgumentException e) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.invalid_trip_id_format", locale);
            throw new BadRequestException(message);
        }

        // Cross-service validations
        try {
            // Validate user exists
            validationService.validateUserExists(currentUser);
            
            // Validate trip availability
            validationService.validateTripAvailability(request.tripId, request.seatsRequested);
            
            // TODO: Add driver validation when trips-service provides driver info
            // validationService.validateUserIsNotDriver(request.tripId, currentUser);
        } catch (BookingValidationException e) {
            System.err.println("Booking validation error: " + e.getMessage());
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.validation_failed", locale);
            throw new BadRequestException(message + ": " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error during validation: " + e.getMessage());
            e.printStackTrace();
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.validation_error", locale);
            throw new BadRequestException(message + ": " + e.getMessage());
        }

        // Create booking
        Booking booking = new Booking(tripId, currentUser, request.seatsRequested, "PENDING");
        booking = repository.save(booking);
        
        return mapToDto(booking);
    }

    @GET
    public List<BookingDto> listMine(@QueryParam("from") String from,
                                     @QueryParam("to") String to,
                                     @QueryParam("status") String status,
                                     @HeaderParam("Accept-Language") String acceptLanguage) {
        String currentUser = AuthContext.getUserId();
        if (currentUser == null || currentUser.isBlank()) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.user_id_required", locale);
            throw new BadRequestException(message);
        }

        java.time.OffsetDateTime fromDt = parseIsoDatetime(from);
        java.time.OffsetDateTime toDt = parseIsoDatetime(to);
        List<Booking> bookings;
        
        if (fromDt != null && toDt != null) {
            bookings = repository.findByPassengerIdAndCreatedAtBetween(currentUser, fromDt, toDt);
        } else {
            bookings = repository.findByPassengerId(currentUser);
        }

        // Filter by status if provided
        if (status != null && !status.isBlank()) {
            bookings = bookings.stream()
                    .filter(b -> status.equalsIgnoreCase(b.getStatus()))
                    .collect(java.util.stream.Collectors.toList());
        }

        return bookings.stream()
                .map(this::mapToDto)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    @GET
    @Path("/mine")
    public List<BookingDto> listMineFiltered(@QueryParam("from") String from,
                                             @QueryParam("to") String to,
                                             @HeaderParam("Accept-Language") String acceptLanguage) {
        String currentUser = AuthContext.getUserId();
        if (currentUser == null || currentUser.isBlank()) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.user_id_required", locale);
            throw new BadRequestException(message);
        }

        java.time.OffsetDateTime fromDt = parseIsoDatetime(from);
        java.time.OffsetDateTime toDt = parseIsoDatetime(to);
        List<Booking> bookings;
        if (fromDt != null && toDt != null) {
            bookings = repository.findByPassengerIdAndCreatedAtBetween(currentUser, fromDt, toDt);
        } else {
            bookings = repository.findByPassengerId(currentUser);
        }

        return bookings.stream()
                .map(this::mapToDto)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private java.time.OffsetDateTime parseIsoDatetime(String iso) {
        if (iso == null || iso.isBlank()) return null;
        try {
            return java.time.OffsetDateTime.parse(iso, java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        } catch (Exception e) {
            return null;
        }
    }

    @GET
    @Path("/{id}")
    public BookingDto getById(@PathParam("id") String id, @HeaderParam("Accept-Language") String acceptLanguage) {
        String currentUser = AuthContext.getUserId();
        if (currentUser == null || currentUser.isBlank()) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.user_id_required", locale);
            throw new BadRequestException(message);
        }

        UUID bookingId;
        try {
            bookingId = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.invalid_booking_id_format", locale);
            throw new BadRequestException(message);
        }

        Booking booking = repository.findById(bookingId)
                .orElseThrow(() -> {
                    Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
                    String message = messageService.getMessage("bookings.error.booking_not_found", locale);
                    return new NotFoundException(message);
                });

        // Ensure user can only access their own bookings
        if (!currentUser.equals(booking.getPassengerId())) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.access_denied", locale);
            throw new ForbiddenException(message);
        }

        return mapToDto(booking);
    }

    @PUT
    @Path("/{id}/confirm")
    public BookingDto confirm(@PathParam("id") String id, @HeaderParam("Accept-Language") String acceptLanguage) {
        String currentUser = AuthContext.getUserId();
        if (currentUser == null || currentUser.isBlank()) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.user_id_required", locale);
            throw new BadRequestException(message);
        }

        UUID bookingId;
        try {
            bookingId = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.invalid_booking_id_format", locale);
            throw new BadRequestException(message);
        }

        Booking booking = repository.findById(bookingId)
                .orElseThrow(() -> {
                    Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
                    String message = messageService.getMessage("bookings.error.booking_not_found", locale);
                    return new NotFoundException(message);
                });

        if (!currentUser.equals(booking.getPassengerId())) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.access_denied", locale);
            throw new ForbiddenException(message);
        }

        if (!booking.isPending()) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.only_pending_can_confirm", locale);
            throw new BadRequestException(message);
        }

        booking.confirm();
        booking = repository.save(booking);
        try { notificationClient.sendBookingConfirmed(currentUser, booking.getTripId().toString(), booking.getSeatsRequested()); } catch (Exception ignored) {}
        
        return mapToDto(booking);
    }

    @PUT
    @Path("/{id}/cancel")
    public BookingDto cancel(@PathParam("id") String id, @HeaderParam("Accept-Language") String acceptLanguage) {
        String currentUser = AuthContext.getUserId();
        if (currentUser == null || currentUser.isBlank()) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.user_id_required", locale);
            throw new BadRequestException(message);
        }

        UUID bookingId;
        try {
            bookingId = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.invalid_booking_id_format", locale);
            throw new BadRequestException(message);
        }

        Booking booking = repository.findById(bookingId)
                .orElseThrow(() -> {
                    Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
                    String message = messageService.getMessage("bookings.error.booking_not_found", locale);
                    return new NotFoundException(message);
                });

        if (!currentUser.equals(booking.getPassengerId())) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.access_denied", locale);
            throw new ForbiddenException(message);
        }

        if (booking.isCancelled()) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("bookings.error.already_cancelled", locale);
            throw new BadRequestException(message);
        }

        booking.cancel();
        booking = repository.save(booking);
        try { notificationClient.sendBookingCancelled(currentUser, booking.getTripId().toString()); } catch (Exception ignored) {}
        
        return mapToDto(booking);
    }

    private BookingDto mapToDto(Booking booking) {
        BookingDto dto = new BookingDto();
        dto.id = booking.getId().toString();
        dto.tripId = booking.getTripId().toString();
        dto.passengerId = booking.getPassengerId();
        dto.seatsRequested = booking.getSeatsRequested();
        dto.status = booking.getStatus();
        return dto;
    }

    public static class BookingCreateDto {
        public String tripId;
        public Integer seatsRequested;
    }
}
