package com.company.covoituraje.trips.api;

import com.company.covoituraje.trips.domain.Trip;
import com.company.covoituraje.trips.infrastructure.TripRepository;
import com.company.covoituraje.shared.i18n.MessageService;
import com.company.covoituraje.shared.i18n.LocaleUtils;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Path("/trips")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TripsResource {

    private final TripRepository repository;
    private final MessageService messageService;
    
    static final class AuthContext {
        private static final ThreadLocal<String> USER_ID = new ThreadLocal<>();
        static void setUserId(String userId) { USER_ID.set(userId); }
        static String getUserId() { return USER_ID.get(); }
        static void clear() { USER_ID.remove(); }
    }

    public TripsResource() {
        this.repository = new TripRepository();
        this.messageService = new MessageService();
    }

    public TripsResource(TripRepository repository) {
        this.repository = repository;
        this.messageService = new MessageService();
    }

    public TripsResource(TripRepository repository, MessageService messageService) {
        this.repository = repository;
        this.messageService = messageService;
    }

    @POST
    public TripDto create(TripCreateDto create, @HeaderParam("Accept-Language") String acceptLanguage) {
        String currentUser = AuthContext.getUserId();
        if (currentUser == null || currentUser.isBlank()) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("trips.error.user_id_required", locale);
            throw new BadRequestException(message);
        }

        // Parse dateTime from ISO8601 string
        OffsetDateTime dateTime = OffsetDateTime.parse(create.dateTime, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        
        // Convert origin to string format
        String originString = create.origin.lat + "," + create.origin.lng;
        
        Trip trip = new Trip(currentUser, originString, create.destinationSedeId, dateTime, create.seatsTotal);
        trip = repository.save(trip);
        
        return mapToDto(trip);
    }

    @GET
    public List<TripDto> list(@QueryParam("destinationSedeId") String destinationSedeId,
                             @QueryParam("from") String from,
                             @QueryParam("to") String to,
                             @QueryParam("status") String status,
                             @HeaderParam("Accept-Language") String acceptLanguage) {
        
        // Prefer full datetime ISO filtering if both from/to are ISO-8601
        java.time.OffsetDateTime fromDt = parseIsoDatetime(from);
        java.time.OffsetDateTime toDt = parseIsoDatetime(to);
        List<Trip> trips;
        if (fromDt != null && toDt != null) {
            if (destinationSedeId != null && !destinationSedeId.isBlank()) {
                trips = repository.findByDestinationSedeIdAndDateTimeBetween(destinationSedeId, fromDt, toDt);
            } else {
                trips = repository.findByDateTimeBetween(fromDt, toDt);
            }
        } else {
            // Fallback: load base set and filter by HH:mm if provided
            if (destinationSedeId != null) {
                trips = repository.findByDestinationSedeId(destinationSedeId);
            } else {
                trips = repository.findAll();
            }
            if ((from != null && !from.isBlank()) || (to != null && !to.isBlank())) {
                Integer fromMinutes = parseTimeToMinutes(from);
                Integer toMinutes = parseTimeToMinutes(to);
                trips = trips.stream()
                        .filter(t -> withinRangeByTimeOfDay(t.getDateTime(), fromMinutes, toMinutes))
                        .collect(java.util.stream.Collectors.toList());
            }
        }

        // Filter by status if provided
        if (status != null && !status.isBlank()) {
            java.time.OffsetDateTime now = java.time.OffsetDateTime.now();
            if ("COMPLETED".equalsIgnoreCase(status)) {
                trips = trips.stream()
                        .filter(t -> t.getDateTime().isBefore(now))
                        .collect(java.util.stream.Collectors.toList());
            } else if ("ACTIVE".equalsIgnoreCase(status)) {
                trips = trips.stream()
                        .filter(t -> t.getDateTime().isAfter(now) || t.getDateTime().isEqual(now))
                        .collect(java.util.stream.Collectors.toList());
            }
        }

        return trips.stream()
                .map(this::mapToDto)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private Integer parseTimeToMinutes(String hhmm) {
        if (hhmm == null || hhmm.isBlank()) return null;
        try {
            String[] parts = hhmm.split(":");
            int h = Integer.parseInt(parts[0]);
            int m = Integer.parseInt(parts[1]);
            return h * 60 + m;
        } catch (Exception e) {
            return null; // Silently ignore malformed times
        }
    }

    private boolean withinRangeByTimeOfDay(java.time.OffsetDateTime dateTime, Integer fromMinutes, Integer toMinutes) {
        int minutes = dateTime.getHour() * 60 + dateTime.getMinute();
        if (fromMinutes != null && minutes < fromMinutes) return false;
        if (toMinutes != null && minutes > toMinutes) return false;
        return true;
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
    public TripDto getById(@PathParam("id") String id, @HeaderParam("Accept-Language") String acceptLanguage) {
        UUID tripId = UUID.fromString(id);
        Trip trip = repository.findById(tripId)
                .orElseThrow(() -> {
                    Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
                    String message = messageService.getMessage("trips.error.trip_not_found", locale);
                    return new NotFoundException(message);
                });
        return mapToDto(trip);
    }

    @PUT
    @Path("/{id}")
    public TripDto update(@PathParam("id") String id, TripCreateDto update, @HeaderParam("Accept-Language") String acceptLanguage) {
        String currentUser = AuthContext.getUserId();
        if (currentUser == null || currentUser.isBlank()) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("trips.error.user_id_required", locale);
            throw new BadRequestException(message);
        }

        UUID tripId = UUID.fromString(id);
        Trip trip = repository.findById(tripId)
                .orElseThrow(() -> {
                    Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
                    String message = messageService.getMessage("trips.error.trip_not_found", locale);
                    return new NotFoundException(message);
                });

        // Only the driver can update their trip (basic rule)
        if (!currentUser.equals(trip.getDriverId())) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("trips.error.only_driver_can_update", locale);
            throw new ForbiddenException(message);
        }

        // Apply partial updates
        if (update != null) {
            if (update.destinationSedeId != null && !update.destinationSedeId.isBlank()) {
                trip.setDestinationSedeId(update.destinationSedeId);
            }
            if (update.dateTime != null && !update.dateTime.isBlank()) {
                OffsetDateTime dt = OffsetDateTime.parse(update.dateTime, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
                trip.setDateTime(dt);
            }
            if (update.seatsTotal > 0) {
                // Calculate currently occupied seats
                int currentOccupiedSeats = trip.getSeatsTotal() - trip.getSeatsFree();
                trip.setSeatsTotal(update.seatsTotal);
                // Recalculate free seats: new total - occupied seats
                trip.setSeatsFree(update.seatsTotal - currentOccupiedSeats);
            }
            if (update.origin != null) {
                String originString = update.origin.lat + "," + update.origin.lng;
                trip.setOrigin(originString);
            }
        }

        trip = repository.save(trip);
        return mapToDto(trip);
    }

    @DELETE
    @Path("/{id}")
    public void delete(@PathParam("id") String id, @HeaderParam("Accept-Language") String acceptLanguage) {
        String currentUser = AuthContext.getUserId();
        if (currentUser == null || currentUser.isBlank()) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("trips.error.user_id_required", locale);
            throw new BadRequestException(message);
        }

        UUID tripId = UUID.fromString(id);
        Trip trip = repository.findById(tripId)
                .orElseThrow(() -> {
                    Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
                    String message = messageService.getMessage("trips.error.trip_not_found", locale);
                    return new NotFoundException(message);
                });

        if (!currentUser.equals(trip.getDriverId())) {
            Locale locale = LocaleUtils.fromAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("trips.error.only_driver_can_delete", locale);
            throw new ForbiddenException(message);
        }

        repository.delete(trip);
    }

    private TripDto mapToDto(Trip trip) {
        TripDto dto = new TripDto();
        dto.id = trip.getId().toString();
        dto.driverId = trip.getDriverId();
        
        // Convert origin string to TripDto.Origin
        String[] coords = trip.getOrigin().split(",");
        TripDto.Origin origin = new TripDto.Origin();
        origin.lat = Double.parseDouble(coords[0]);
        origin.lng = Double.parseDouble(coords[1]);
        dto.origin = origin;
        
        dto.destinationSedeId = trip.getDestinationSedeId();
        dto.dateTime = trip.getDateTime().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        dto.seatsTotal = trip.getSeatsTotal();
        dto.seatsFree = trip.getSeatsFree();
        return dto;
    }
}
