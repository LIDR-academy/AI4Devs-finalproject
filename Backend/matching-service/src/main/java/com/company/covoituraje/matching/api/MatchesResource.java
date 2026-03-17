package com.company.covoituraje.matching.api;

import com.company.covoituraje.matching.service.MatchingService;
import com.company.covoituraje.matching.infrastructure.MatchRepository;
import com.company.covoituraje.matching.integration.TripsServiceClient;
import com.company.covoituraje.matching.integration.NotificationServiceClient;
import com.company.covoituraje.matching.integration.NotificationEventPublisher;
import com.company.covoituraje.shared.i18n.MessageService;
import com.company.covoituraje.shared.i18n.LocaleUtils;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Path("/matches")
@Produces(MediaType.APPLICATION_JSON)
public class MatchesResource {

    private final MatchingService matchingService;
    private final MatchRepository matchRepository;
    private final NotificationServiceClient notificationClient;
    private final NotificationEventPublisher eventPublisher;
    private final MessageService messageService;
    
    static final class AuthContext {
        private static final ThreadLocal<String> USER_ID = new ThreadLocal<>();
        static void setUserId(String userId) { USER_ID.set(userId); }
        static String getUserId() { return USER_ID.get(); }
        static void clear() { USER_ID.remove(); }
    }

    public MatchesResource() {
        String tripsServiceUrl = System.getenv("TRIPS_SERVICE_URL");
        if (tripsServiceUrl == null || tripsServiceUrl.isBlank()) {
            tripsServiceUrl = "http://localhost:8081";
        }
        MatchRepository matchRepository = new MatchRepository();
        TripsServiceClient tripsServiceClient = new TripsServiceClient(tripsServiceUrl);
        this.matchingService = new MatchingService(matchRepository, tripsServiceClient);
        this.matchRepository = matchRepository;
        String notificationServiceUrl = System.getenv().getOrDefault("NOTIFICATION_SERVICE_URL", "http://localhost:8085/api");
        this.notificationClient = new NotificationServiceClient(notificationServiceUrl);
        this.eventPublisher = new NotificationEventPublisher(notificationClient);
        this.messageService = new MessageService();
    }

    public MatchesResource(MatchingService matchingService, MatchRepository matchRepository) {
        this.matchingService = matchingService;
        this.matchRepository = matchRepository;
        String notificationServiceUrl = System.getenv().getOrDefault("NOTIFICATION_SERVICE_URL", "http://localhost:8085/api");
        this.notificationClient = new NotificationServiceClient(notificationServiceUrl);
        this.eventPublisher = new NotificationEventPublisher(notificationClient);
        this.messageService = new MessageService();
    }

    public MatchesResource(MatchingService matchingService, MatchRepository matchRepository, NotificationServiceClient notificationClient) {
        this.matchingService = matchingService;
        this.matchRepository = matchRepository;
        this.notificationClient = notificationClient;
        this.eventPublisher = new NotificationEventPublisher(notificationClient);
        this.messageService = new MessageService();
    }

    public MatchesResource(MatchingService matchingService, MatchRepository matchRepository, NotificationServiceClient notificationClient, MessageService messageService) {
        this.matchingService = matchingService;
        this.matchRepository = matchRepository;
        this.notificationClient = notificationClient;
        this.eventPublisher = new NotificationEventPublisher(notificationClient);
        this.messageService = messageService;
    }

    @GET
    public List<MatchDto> findMatches(@QueryParam("destinationSedeId") String destinationSedeId,
                                     @QueryParam("originSedeId") String originSedeId,
                                     @QueryParam("time") String time,
                                     @QueryParam("origin") String origin,
                                     @QueryParam("direction") String direction,
                                     @HeaderParam("Accept-Language") String acceptLanguage) {
        
        String currentUser = AuthContext.getUserId();
        if (currentUser == null || currentUser.isBlank()) {
            Locale locale = LocaleUtils.parseAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("matches.error.user_id_required", locale);
            throw new BadRequestException(message);
        }

        // Validate required parameters
        if (direction == null || direction.isBlank()) {
            Locale locale = LocaleUtils.parseAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("matches.error.direction_required", locale);
            throw new BadRequestException(message);
        }

        // Validate sede parameter based on direction
        String sedeId;
        if ("TO_SEDE".equals(direction)) {
            if (destinationSedeId == null || destinationSedeId.isBlank()) {
                Locale locale = LocaleUtils.parseAcceptLanguage(acceptLanguage);
                String message = messageService.getMessage("matches.error.destination_sede_required", locale);
                throw new BadRequestException(message);
            }
            sedeId = destinationSedeId;
        } else if ("FROM_SEDE".equals(direction)) {
            if (originSedeId == null || originSedeId.isBlank()) {
                Locale locale = LocaleUtils.parseAcceptLanguage(acceptLanguage);
                String message = messageService.getMessage("matches.error.origin_sede_required", locale);
                throw new BadRequestException(message);
            }
            sedeId = originSedeId;
        } else {
            Locale locale = LocaleUtils.parseAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("matches.error.invalid_direction", locale);
            throw new BadRequestException(message);
        }

        // Use the matching service to find real matches
        List<MatchResult> matches = matchingService.findMatches(
            currentUser, 
            sedeId, 
            time, 
            origin,
            direction
        );

        // Emit match found events for high-score matches
        Locale locale = LocaleUtils.parseAcceptLanguage(acceptLanguage);
        for (MatchResult match : matches) {
            if (match.score >= 0.7) { // Only notify for good matches
                try {
                    // Get user email (simplified for now - in production would be async)
                    String userEmail = "user-" + currentUser + "@example.com"; // TODO: Get real email from users-service
                    eventPublisher.publishMatchFound(
                        currentUser, 
                        userEmail, 
                        match.tripId, 
                        match.driverId, 
                        match.score, 
                        locale
                    );
                } catch (Exception e) {
                    System.err.println("Failed to publish match found event: " + e.getMessage());
                }
            }
        }

        // Convert to DTOs
        return matches.stream()
                .map(this::mapToDto)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    @GET
    @Path("/my-matches")
    public List<MatchDto> getMyMatches(@QueryParam("from") String from,
                                       @QueryParam("to") String to,
                                       @HeaderParam("Accept-Language") String acceptLanguage) {
        String currentUser = AuthContext.getUserId();
        if (currentUser == null || currentUser.isBlank()) {
            Locale locale = LocaleUtils.parseAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("matches.error.user_id_required", locale);
            throw new BadRequestException(message);
        }

        java.time.OffsetDateTime fromDt = parseIsoDatetime(from);
        java.time.OffsetDateTime toDt = parseIsoDatetime(to);
        List<com.company.covoituraje.matching.domain.Match> matches;
        if (fromDt != null && toDt != null) {
            matches = matchRepository.findByPassengerIdAndCreatedAtBetween(currentUser, fromDt, toDt);
        } else {
            matches = matchRepository.findByPassengerId(currentUser);
        }

        return matches.stream()
                .map(this::mapDomainToDto)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    @GET
    @Path("/driver/{driverId}")
    public List<MatchDto> getDriverMatches(@PathParam("driverId") String driverId,
                                           @QueryParam("from") String from,
                                           @QueryParam("to") String to,
                                           @HeaderParam("Accept-Language") String acceptLanguage) {
        String currentUser = AuthContext.getUserId();
        if (currentUser == null || currentUser.isBlank()) {
            Locale locale = LocaleUtils.parseAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("matches.error.user_id_required", locale);
            throw new BadRequestException(message);
        }

        // For now, only allow users to see their own matches
        // In the future, drivers should be able to see matches for their trips
        if (!currentUser.equals(driverId)) {
            Locale locale = LocaleUtils.parseAcceptLanguage(acceptLanguage);
            String message = messageService.getMessage("matches.error.access_denied", locale);
            throw new ForbiddenException(message);
        }

        java.time.OffsetDateTime fromDt = parseIsoDatetime(from);
        java.time.OffsetDateTime toDt = parseIsoDatetime(to);
        List<com.company.covoituraje.matching.domain.Match> matches;
        if (fromDt != null && toDt != null) {
            matches = matchRepository.findByDriverIdAndCreatedAtBetween(driverId, fromDt, toDt);
        } else {
            matches = matchRepository.findByDriverId(driverId);
        }

        return matches.stream()
                .map(this::mapDomainToDto)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private MatchDto mapToDto(MatchResult matchResult) {
        MatchDto dto = new MatchDto();
        dto.tripId = matchResult.tripId;
        dto.driverId = matchResult.driverId;
        dto.origin = matchResult.origin;
        dto.destinationSedeId = matchResult.destinationSedeId;
        dto.dateTime = matchResult.dateTime;
        dto.seatsFree = matchResult.seatsFree;
        dto.score = matchResult.score;
        dto.reasons = matchResult.reasons;
        dto.direction = matchResult.direction;
        dto.pairedTripId = matchResult.pairedTripId;
        return dto;
    }

    private MatchDto mapDomainToDto(com.company.covoituraje.matching.domain.Match match) {
        MatchDto dto = new MatchDto();
        dto.tripId = match.getTripId().toString();
        dto.driverId = match.getDriverId();
        dto.score = match.getMatchScore().doubleValue();
        dto.status = match.getStatus();
        return dto;
    }

    private java.time.OffsetDateTime parseIsoDatetime(String iso) {
        if (iso == null || iso.isBlank()) return null;
        try {
            return java.time.OffsetDateTime.parse(iso, java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        } catch (Exception e) {
            return null;
        }
    }

    @PUT
    @Path("/{id}/accept")
    public MatchDto accept(@PathParam("id") String id) {
        String currentUser = AuthContext.getUserId();
        if (currentUser == null || currentUser.isBlank()) {
            throw new BadRequestException("User ID is required");
        }
        java.util.UUID matchId;
        try { matchId = java.util.UUID.fromString(id); } catch (IllegalArgumentException e) { throw new BadRequestException("Invalid match ID format"); }
        com.company.covoituraje.matching.domain.Match match = matchRepository.findById(matchId).orElseThrow(() -> new NotFoundException("Match not found"));
        if (!currentUser.equals(match.getPassengerId()) && !currentUser.equals(match.getDriverId())) {
            throw new ForbiddenException("Access denied");
        }
        match.accept();
        match = matchRepository.save(match);
        try { notificationClient.sendMatchAccepted(match.getPassengerId(), match.getDriverId(), match.getTripId().toString()); } catch (Exception ignored) {}
        return mapDomainToDto(match);
    }

    @PUT
    @Path("/{id}/reject")
    public MatchDto reject(@PathParam("id") String id) {
        String currentUser = AuthContext.getUserId();
        if (currentUser == null || currentUser.isBlank()) {
            throw new BadRequestException("User ID is required");
        }
        java.util.UUID matchId;
        try { matchId = java.util.UUID.fromString(id); } catch (IllegalArgumentException e) { throw new BadRequestException("Invalid match ID format"); }
        com.company.covoituraje.matching.domain.Match match = matchRepository.findById(matchId).orElseThrow(() -> new NotFoundException("Match not found"));
        if (!currentUser.equals(match.getPassengerId()) && !currentUser.equals(match.getDriverId())) {
            throw new ForbiddenException("Access denied");
        }
        match.reject();
        match = matchRepository.save(match);
        try { notificationClient.sendMatchRejected(match.getPassengerId(), match.getTripId().toString()); } catch (Exception ignored) {}
        return mapDomainToDto(match);
    }
}
