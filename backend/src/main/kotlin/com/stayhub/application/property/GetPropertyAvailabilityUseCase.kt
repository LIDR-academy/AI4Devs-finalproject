package com.stayhub.application.property

import com.stayhub.application.error.NotFoundException
import com.stayhub.application.error.ValidationException
import com.stayhub.domain.availability.AvailabilityRepository
import com.stayhub.domain.availability.UnavailableDate
import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.property.PropertyRepository
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.UUID

@Service
class GetPropertyAvailabilityUseCase(
    private val availabilityRepository: AvailabilityRepository,
    private val propertyRepository: PropertyRepository,
    private val bookingRepository: BookingRepository,
) {
    suspend fun execute(
        propertyId: UUID,
        from: LocalDate,
        to: LocalDate,
    ): List<UnavailableDate> {
        if (!from.isBefore(to)) {
            throw ValidationException("'from' date must be before 'to' date")
        }
        propertyRepository.findById(propertyId)
            ?: throw NotFoundException("Property not found: $propertyId")

        val fromTable = availabilityRepository.findUnavailableDates(propertyId, from, to)

        // A booking's nights are [checkIn, checkOut) — the checkout day is free.
        // Fold overlapping non-cancelled bookings (pending + confirmed) into the
        // unavailable set so the calendar matches the booking-creation conflict
        // check (#156). Clip each booking's nights to the queried [from, to] window.
        val fromBookings = bookingRepository.findByPropertyAndDates(propertyId, from, to)
            .flatMap { booking ->
                val start = maxOf(booking.checkIn, from)
                generateSequence(start) { it.plusDays(1) }
                    .takeWhile { it.isBefore(booking.checkOut) && !it.isAfter(to) }
                    .map { UnavailableDate(it, "booked") }
                    .toList()
            }

        // Merge + dedupe by date, preferring a concrete reason ("booked"/"blocked") over "held".
        return (fromTable + fromBookings)
            .groupBy { it.date }
            .map { (_, entries) -> entries.firstOrNull { it.reason != "held" } ?: entries.first() }
            .sortedBy { it.date }
    }
}
