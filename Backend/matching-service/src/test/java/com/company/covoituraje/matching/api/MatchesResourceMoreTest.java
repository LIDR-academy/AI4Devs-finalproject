package com.company.covoituraje.matching.api;

import com.company.covoituraje.matching.integration.TripsServiceClient;
import com.company.covoituraje.matching.service.MatchingService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import com.company.covoituraje.matching.infrastructure.MatchRepository;

import static org.junit.jupiter.api.Assertions.*;

class MatchesResourceMoreTest {

    private MatchesResource resource;

    @BeforeEach
    void setUp() {
        MatchRepository repo = Mockito.mock(MatchRepository.class);
        org.mockito.Mockito.when(repo.findByDriverId(org.mockito.ArgumentMatchers.any())).thenReturn(java.util.Collections.emptyList());
        org.mockito.Mockito.when(repo.findByPassengerIdAndCreatedAtBetween(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn(java.util.Collections.emptyList());
        org.mockito.Mockito.when(repo.findByDriverIdAndCreatedAtBetween(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn(java.util.Collections.emptyList());
        TripsServiceClient tripsClient = Mockito.mock(TripsServiceClient.class);
        MatchingService svc = new MatchingService(repo, tripsClient);
        resource = new MatchesResource(svc, repo);
        MatchesResource.AuthContext.setUserId("user-1");
    }

    @AfterEach
    void tearDown() {
        MatchesResource.AuthContext.clear();
    }

    @Test
    void findMatches_requiresDestination() {
        assertThrows(jakarta.ws.rs.BadRequestException.class, () -> resource.findMatches(null, "08:00", "Madrid"));
    }

    @Test
    void driverMatches_forbidden_whenDifferentUser() {
        assertThrows(jakarta.ws.rs.ForbiddenException.class, () -> resource.getDriverMatches("driver-xyz", null, null));
    }
}


