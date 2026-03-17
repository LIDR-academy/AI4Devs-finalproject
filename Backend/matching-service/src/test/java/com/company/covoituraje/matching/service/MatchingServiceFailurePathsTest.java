package com.company.covoituraje.matching.service;

import com.company.covoituraje.http.ServiceIntegrationException;
import com.company.covoituraje.matching.api.MatchResult;
import com.company.covoituraje.matching.infrastructure.MatchRepository;
import com.company.covoituraje.matching.integration.TripsServiceClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

class MatchingServiceFailurePathsTest {

    private MatchingService matchingService;
    private MatchRepository mockRepository;
    private TripsServiceClient mockTripsClient;

    @BeforeEach
    void setUp() {
        mockRepository = Mockito.mock(MatchRepository.class);
        mockTripsClient = Mockito.mock(TripsServiceClient.class);
        matchingService = new MatchingService(mockRepository, mockTripsClient);
    }

    @Test
    void shouldReturnEmptyListWhenTripsClientThrows() throws Exception {
        String passengerId = "p-1";
        String sedeId = "SEDE-1";
        String time = "09:00";
        String origin = "Madrid Centro";
        String direction = "TO_SEDE";

        Mockito.doThrow(new ServiceIntegrationException("timeout"))
            .when(mockTripsClient)
            .getAvailableTrips(sedeId, direction);

        List<MatchResult> results = matchingService.findMatches(passengerId, sedeId, time, origin, direction);
        assertTrue(results.isEmpty());
    }
}


