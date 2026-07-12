package com.stayhub.domain.booking

import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.UUID

/**
 * Booking aggregate root.
 *
 * Invariants enforced at construction:
 *  - checkOut must be strictly after checkIn
 *  - guestCount must be > 0
 *
 * Note: the maxGuests constraint (guestCount <= property.maxGuests) is enforced
 * in the use-case layer, not here, because maxGuests lives on the Property aggregate.
 *
 * nights is passed in as a constructor parameter rather than derived here because
 * it is stored in the DB schema and must be consistent with the persisted record.
 * The use-case layer is responsible for computing it as (checkOut - checkIn).toInt().
 */
data class Booking(
    val id: UUID,
    val propertyId: UUID,
    val guestId: UUID,
    val referenceNumber: String,
    val checkIn: LocalDate,
    val checkOut: LocalDate,
    val guestCount: Int,
    /** Stored column — computed by use-case as ChronoUnit.DAYS.between(checkIn, checkOut). */
    val nights: Int,
    val nightlyRateEur: BigDecimal,
    val cleaningFeeEur: BigDecimal,
    /** 12% of subtotal (nightlyRateEur * nights + cleaningFeeEur). */
    val serviceFeeEur: BigDecimal,
    /** 0.0 for v1. */
    val taxEur: BigDecimal,
    val totalEur: BigDecimal,
    val status: BookingStatus,
    val stripePaymentIntentId: String,
    val cancellationReason: String?,
    val cancelledAt: Instant?,
    val createdAt: Instant,
    val updatedAt: Instant,
) {
    init {
        require(checkOut.isAfter(checkIn)) {
            "checkOut ($checkOut) must be after checkIn ($checkIn)"
        }
        require(guestCount > 0) {
            "guestCount must be > 0, was $guestCount"
        }
        val expectedNights = ChronoUnit.DAYS.between(checkIn, checkOut).toInt()
        require(nights == expectedNights) {
            "nights ($nights) does not match checkOut - checkIn ($expectedNights days)"
        }
    }

    /**
     * Transitions PENDING → CONFIRMED.
     *
     * @throws IllegalStateException if the booking is not in PENDING status.
     */
    fun confirm(): Booking {
        check(status == BookingStatus.PENDING) {
            "Cannot confirm a booking with status $status — only PENDING bookings can be confirmed"
        }
        return copy(status = BookingStatus.CONFIRMED, updatedAt = Instant.now())
    }

    /**
     * Transitions PENDING or CONFIRMED → CANCELLED.
     *
     * @param reason optional human-readable reason for cancellation.
     * @throws IllegalStateException if the booking is already CANCELLED or COMPLETED.
     */
    fun cancel(reason: String? = null): Booking {
        check(status != BookingStatus.CANCELLED) {
            "Booking is already CANCELLED"
        }
        check(status != BookingStatus.COMPLETED) {
            "Cannot cancel a COMPLETED booking"
        }
        val now = Instant.now()
        return copy(
            status = BookingStatus.CANCELLED,
            cancellationReason = reason,
            cancelledAt = now,
            updatedAt = now,
        )
    }
}
