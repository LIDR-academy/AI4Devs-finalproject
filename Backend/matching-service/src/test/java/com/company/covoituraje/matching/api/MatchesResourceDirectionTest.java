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

class MatchesResourceDirectionTest {

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
    void shouldFindMatchesWithDirectionFilter() {
        // Given
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
        mockMatch.reasons = Arrays.asList("Direction match: TO_SEDE", "Time compatibility: Good");

        when(mockMatchingService.findMatches(any(), any(), any(), any(), any()))
            .thenReturn(Arrays.asList(mockMatch));

        // When
        List<MatchDto> matches = resource.findMatches(destinationSedeId, null, time, origin, direction, "en");

        // Then
        assertFalse(matches.isEmpty());
        MatchDto match = matches.get(0);
        assertEquals("trip-1", match.tripId);
        assertEquals("TO_SEDE", match.direction);
        assertNull(match.pairedTripId);
        assertTrue(match.reasons.contains("Direction match: TO_SEDE"));
    }

    @Test
    void shouldFilterOutOppositeDirectionTrips() {
        // Given
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
        mockMatch.score = 0.0; // No match due to opposite direction
        mockMatch.direction = "FROM_SEDE";
        mockMatch.pairedTripId = null;
        mockMatch.reasons = Arrays.asList("Direction mismatch: FROM_SEDE vs TO_SEDE");

        when(mockMatchingService.findMatches(any(), any(), any(), any(), any()))
            .thenReturn(Arrays.asList()); // Empty list because opposite direction should be filtered out

        // When
        List<MatchDto> matches = resource.findMatches(destinationSedeId, null, time, origin, direction, "en");

        // Then
        assertTrue(matches.isEmpty());
    }

    @Test
    void shouldHandlePairedTripsCorrectly() {
        // Given
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
        mockMatch.score = 0.9; // Higher score for paired trip
        mockMatch.direction = "TO_SEDE";
        mockMatch.pairedTripId = "trip-2";
        mockMatch.reasons = Arrays.asList("Direction match: TO_SEDE", "Paired trip available", "Time compatibility: Perfect");

        when(mockMatchingService.findMatches(any(), any(), any(), any(), any()))
            .thenReturn(Arrays.asList(mockMatch));

        // When
        List<MatchDto> matches = resource.findMatches(destinationSedeId, null, time, origin, direction, "en");

        // Then
        assertFalse(matches.isEmpty());
        MatchDto match = matches.get(0);
        assertEquals("trip-1", match.tripId);
        assertEquals("TO_SEDE", match.direction);
        assertEquals("trip-2", match.pairedTripId);
        assertTrue(match.reasons.contains("Paired trip available"));
    }

    @Test
    void shouldRequireDirectionParameter() {
        // Given
        String destinationSedeId = "SEDE-1";
        String time = "09:00";
        String origin = "Madrid Centro";
        String direction = null; // Missing direction

        when(mockMessageService.getMessage(any(), any())).thenReturn("Direction is required");

        // When & Then
        assertThrows(BadRequestException.class, () -> {
            resource.findMatches(destinationSedeId, null, time, origin, direction, "en");
        });
    }
}
