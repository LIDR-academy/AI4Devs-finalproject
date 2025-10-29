package com.company.covoituraje.matching.api;

import com.company.covoituraje.matching.integration.TripsServiceClient;
import com.company.covoituraje.matching.service.MatchingService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import com.company.covoituraje.matching.infrastructure.MatchRepository;

import static org.junit.jupiter.api.Assertions.*;

class MatchesResourceTest {

    private MatchesResource resource;

    @BeforeEach
    void setUp() {
        MatchRepository repo = Mockito.mock(MatchRepository.class);
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
    void myMatches_returnsUserMatches() {
        java.util.List<MatchDto> list = resource.getMyMatches(null, null, "en");
        assertNotNull(list);
    }
}
