package com.company.covoituraje.booking.api;

import com.company.covoituraje.booking.domain.Booking;
import com.company.covoituraje.booking.infrastructure.BookingRepository;
import com.company.covoituraje.booking.integration.NotificationServiceClient;
import com.company.covoituraje.booking.service.BookingValidationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BookingResourceNotificationsTest {

    private BookingRepository repository;
    private BookingValidationService validationService;
    private NotificationServiceClient notifications;
    private BookingResource resource;

    @BeforeEach
    void setUp() {
        repository = mock(BookingRepository.class);
        validationService = mock(BookingValidationService.class);
        notifications = mock(NotificationServiceClient.class);
        resource = new BookingResource(repository, validationService, notifications);
        BookingResource.AuthContext.setUserId("user-001");
    }

    @AfterEach
    void tearDown() {
        BookingResource.AuthContext.clear();
    }

    @Test
    void confirm_should_send_notification() throws Exception {
        UUID bookingId = UUID.randomUUID();
        Booking booking = new Booking(UUID.randomUUID(), "user-001", 2, "PENDING");
        when(repository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        BookingDto dto = resource.confirm(bookingId.toString());

        assertEquals("CONFIRMED", dto.status);
        verify(notifications).bookingConfirmed(any());
    }

    @Test
    void cancel_should_send_notification() throws Exception {
        UUID bookingId = UUID.randomUUID();
        Booking booking = new Booking(UUID.randomUUID(), "user-001", 1, "CONFIRMED");
        when(repository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        BookingDto dto = resource.cancel(bookingId.toString());

        assertEquals("CANCELLED", dto.status);
        verify(notifications).sendBookingCancelled("user-001", booking.getTripId().toString());
    }
}


