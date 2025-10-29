package com.company.covoituraje.matching.api;

import com.company.covoituraje.matching.domain.Match;
import com.company.covoituraje.matching.infrastructure.MatchRepository;
import com.company.covoituraje.matching.integration.TripsServiceClient;
import com.company.covoituraje.matching.service.MatchingService;
import com.company.covoituraje.matching.integration.NotificationServiceClient;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class MatchesResourceNotificationsTest {

    private MatchRepository repository;
    private MatchingService service;
    private NotificationServiceClient notifications;
    private MatchesResource resource;

    @BeforeEach
    void setUp() {
        repository = Mockito.mock(MatchRepository.class);
        TripsServiceClient trips = Mockito.mock(TripsServiceClient.class);
        service = new MatchingService(repository, trips);
        notifications = Mockito.mock(NotificationServiceClient.class);
        resource = new MatchesResource(service, repository, notifications);
        MatchesResource.AuthContext.setUserId("user-1");
    }

    @AfterEach
    void tearDown() {
        MatchesResource.AuthContext.clear();
    }

    @Test
    void accept_should_send_notification_to_driver_and_passenger() throws Exception {
        UUID matchId = UUID.randomUUID();
        Match m = new Match(UUID.randomUUID(), "user-1", "driver-1", BigDecimal.valueOf(0.8), "PENDING");
        when(repository.findById(matchId)).thenReturn(Optional.of(m));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        MatchDto dto = resource.accept(matchId.toString());

        assertEquals("ACCEPTED", dto.status);
        verify(notifications).sendMatchAccepted("user-1", "driver-1", m.getTripId().toString());
    }

    @Test
    void reject_should_send_notification_to_passenger() throws Exception {
        UUID matchId = UUID.randomUUID();
        Match m = new Match(UUID.randomUUID(), "user-1", "driver-1", BigDecimal.valueOf(0.8), "PENDING");
        when(repository.findById(matchId)).thenReturn(Optional.of(m));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        MatchDto dto = resource.reject(matchId.toString());

        assertEquals("REJECTED", dto.status);
        verify(notifications).sendMatchRejected("user-1", m.getTripId().toString());
    }
}
