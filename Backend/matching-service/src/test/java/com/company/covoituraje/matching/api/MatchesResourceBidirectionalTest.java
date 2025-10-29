package com.company.covoituraje.matching.api;

import com.company.covoituraje.matching.service.MatchingService;
import com.company.covoituraje.matching.infrastructure.MatchRepository;
import com.company.covoituraje.matching.integration.TripsServiceClient;
import com.company.covoituraje.matching.integration.NotificationServiceClient;
import com.company.covoituraje.shared.i18n.MessageService;
import com.company.covoituraje.matching.api.MatchResult;
import jakarta.ws.rs.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class MatchesResourceBidirectionalTest {

    private MatchesResource resource;
    private MatchingService mockMatchingService;
    private MatchRepository mockRepository;
    private NotificationServiceClient mockNotificationClient;
    private MessageService mockMessageService;

    @BeforeEach
    void setUp() {
        mockMatchingService = Mockito.mock(MatchingService.class);
        mockRepository = Mockito.mock(MatchRepository.class);
        mockNotificationClient = Mockito.mock(NotificationServiceClient.class);
        mockMessageService = Mockito.mock(MessageService.class);
        
        resource = new MatchesResource(mockMatchingService, mockRepository, mockNotificationClient, mockMessageService);
        MatchesResource.AuthContext.setUserId("test-passenger-id");
    }

    @Test
    void shouldFindMatchesToSede() {
        // Given - Search for trips TO a sede
        String destinationSedeId = "SEDE-1";
        String time = "09:00";
        String origin = "Madrid Centro";
        String direction = "TO_SEDE";

        MatchResult mockMatch = new MatchResult();
        mockMatch.tripId = "trip-1";
        mockMatch.driverId = "driver-1";
        mockMatch.origin = "40.4168,-3.7038";
        mockMatch.destinationSedeId = "SEDE-1";
        mockMatch.dateTime = "2024-01-15T09:00:00+01:00";
        mockMatch.seatsFree = 2;
        mockMatch.score = 0.8;
        mockMatch.direction = "TO_SEDE";
        mockMatch.pairedTripId = null;
        mockMatch.reasons = Arrays.asList("Direction match: TO_SEDE", "Same destination");

        when(mockMatchingService.findMatches(any(), any(), any(), any(), any()))
            .thenReturn(Arrays.asList(mockMatch));

        // When
        List<MatchDto> matches = resource.findMatches(destinationSedeId, null, time, origin, direction, "en");

        // Then
        assertFalse(matches.isEmpty());
        MatchDto match = matches.get(0);
        assertEquals("trip-1", match.tripId);
        assertEquals("TO_SEDE", match.direction);
        assertEquals("SEDE-1", match.destinationSedeId);
    }

    @Test
    void shouldFindMatchesFromSede() {
        // Given - Search for trips FROM a sede
        String originSedeId = "SEDE-1";
        String time = "17:00";
        String origin = "Madrid Centro";
        String direction = "FROM_SEDE";

        MatchResult mockMatch = new MatchResult();
        mockMatch.tripId = "trip-2";
        mockMatch.driverId = "driver-2";
        mockMatch.origin = "40.4168,-3.7038";
        mockMatch.destinationSedeId = "SEDE-1";
        mockMatch.dateTime = "2024-01-15T17:00:00+01:00";
        mockMatch.seatsFree = 2;
        mockMatch.score = 0.8;
        mockMatch.direction = "FROM_SEDE";
        mockMatch.pairedTripId = null;
        mockMatch.reasons = Arrays.asList("Direction match: FROM_SEDE", "Same destination");

        when(mockMatchingService.findMatches(any(), any(), any(), any(), any()))
            .thenReturn(Arrays.asList(mockMatch));

        // When
        List<MatchDto> matches = resource.findMatches(null, originSedeId, time, origin, direction, "en");

        // Then
        assertFalse(matches.isEmpty());
        MatchDto match = matches.get(0);
        assertEquals("trip-2", match.tripId);
        assertEquals("FROM_SEDE", match.direction);
    }

    @Test
    void shouldRequireDestinationSedeForToSedeDirection() {
        // Given - TO_SEDE direction without destinationSedeId
        String time = "09:00";
        String origin = "Madrid Centro";
        String direction = "TO_SEDE";

        when(mockMessageService.getMessage(any(), any())).thenReturn("Destination sede is required");

        // When & Then
        assertThrows(BadRequestException.class, () -> {
            resource.findMatches(null, null, time, origin, direction, "en");
        });
    }

    @Test
    void shouldRequireOriginSedeForFromSedeDirection() {
        // Given - FROM_SEDE direction without originSedeId
        String time = "17:00";
        String origin = "Madrid Centro";
        String direction = "FROM_SEDE";

        when(mockMessageService.getMessage(any(), any())).thenReturn("Origin sede is required");

        // When & Then
        assertThrows(BadRequestException.class, () -> {
            resource.findMatches(null, null, time, origin, direction, "en");
        });
    }

    @Test
    void shouldRejectInvalidDirection() {
        // Given - Invalid direction
        String destinationSedeId = "SEDE-1";
        String time = "09:00";
        String origin = "Madrid Centro";
        String direction = "INVALID_DIRECTION";

        when(mockMessageService.getMessage(any(), any())).thenReturn("Invalid direction");

        // When & Then
        assertThrows(BadRequestException.class, () -> {
            resource.findMatches(destinationSedeId, null, time, origin, direction, "en");
        });
    }
}
