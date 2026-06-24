package com.stayhub.application.booking

import com.stayhub.application.error.DatesUnavailableException
import com.stayhub.application.error.NotFoundException
import com.stayhub.application.error.ValidationException
import com.stayhub.domain.availability.AvailabilityHoldRepository
import com.stayhub.domain.availability.AvailabilityRepository
import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.booking.BookingStatus
import com.stayhub.domain.booking.PaymentService
import com.stayhub.domain.property.PropertyRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.security.SecureRandom
import java.time.Instant
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.UUID

/**
 * Creates a booking in PENDING status, places a 10-minute availability hold,
 * and returns a Stripe PaymentIntent client_secret for frontend payment
 * confirmation.
 *
 * Order of operations (matters for double-booking safety):
 *  1. Load property — 404 if missing.
 *  2. Reject if guestCount > property.maxGuests.
 *  3. Reject if an active hold or non-cancelled overlapping booking exists (409).
 *  4. Create 10-minute hold so concurrent requests can't slip past step 3.
 *  5. Create Stripe PaymentIntent for the total amount.
 *  6. Persist booking with status=PENDING.
 */
@Service
class CreateBookingUseCase(
    private val propertyRepository: PropertyRepository,
    private val bookingRepository: BookingRepository,
    private val holdRepository: AvailabilityHoldRepository,
    private val availabilityRepository: AvailabilityRepository,
    private val paymentService: PaymentService,
) {
    suspend fun execute(command: CreateBookingCommand): CreateBookingResult {
        // ── 0. Basic input validation ────────────────────────────────────────
        if (!command.checkIn.isBefore(command.checkOut)) {
            throw ValidationException("check_in must be before check_out")
        }
        if (!command.checkIn.isAfter(LocalDate.now().minusDays(1))) {
            throw ValidationException("check_in must be today or in the future")
        }
        if (command.guestCount < 1) {
            throw ValidationException("guest_count must be >= 1")
        }

        // ── 1. Load property ────────────────────────────────────────────────
        val property = propertyRepository.findById(command.propertyId)
            ?: throw NotFoundException("Property not found: ${command.propertyId}")

        if (command.guestCount > property.maxGuests) {
            throw ValidationException(
                "guest_count (${command.guestCount}) exceeds property max_guests (${property.maxGuests})"
            )
        }

        // ── 2/3. Availability checks ────────────────────────────────────────
        val existingHold = holdRepository.findActiveHoldForDates(
            command.propertyId,
            command.checkIn,
            command.checkOut,
        )
        if (existingHold != null) {
            throw DatesUnavailableException("Dates are currently held by another booking attempt")
        }

        val overlapping = bookingRepository.findByPropertyAndDates(
            command.propertyId,
            command.checkIn,
            command.checkOut,
        )
        if (overlapping.any { it.status != BookingStatus.CANCELLED }) {
            throw DatesUnavailableException("Property is already booked for the requested dates")
        }

        // The availability table is the same source the detail calendar and the
        // search filter consult. The occupied nights are [checkIn, checkOut-1];
        // findUnavailableDates uses an inclusive [from, to] range.
        val unavailableNights = availabilityRepository.findUnavailableDates(
            command.propertyId,
            command.checkIn,
            command.checkOut.minusDays(1),
        )
        if (unavailableNights.isNotEmpty()) {
            throw DatesUnavailableException("Property is already booked for the requested dates")
        }

        // ── 4. Compute price ────────────────────────────────────────────────
        val nights = ChronoUnit.DAYS.between(command.checkIn, command.checkOut).toInt()
        val nightlyRate = round2(property.nightlyRateEur)
        val cleaningFee = round2(property.cleaningFeeEur)
        val subtotal = round2(nightlyRate * nights)
        val serviceFee = round2(subtotal * SERVICE_FEE_RATE)
        val tax = 0.0
        val total = round2(subtotal + cleaningFee + serviceFee + tax)

        val priceBreakdown = BookingPriceBreakdown(
            nights = nights,
            nightlyRateEur = nightlyRate,
            subtotalEur = subtotal,
            cleaningFeeEur = cleaningFee,
            serviceFeeEur = serviceFee,
            taxEur = tax,
            totalEur = total,
        )

        // ── 5. Place hold ───────────────────────────────────────────────────
        val hold = holdRepository.createHold(
            propertyId = command.propertyId,
            guestId = command.guestId,
            checkIn = command.checkIn,
            checkOut = command.checkOut,
        )

        // ── 6. Create PaymentIntent ─────────────────────────────────────────
        val bookingId = UUID.randomUUID()
        val paymentIntent = paymentService.createPaymentIntent(
            amountEur = priceBreakdown.totalAsBigDecimal(),
            bookingId = bookingId,
        )

        // ── 7. Persist booking (PENDING) ────────────────────────────────────
        val now = Instant.now()
        val booking = Booking(
            id = bookingId,
            propertyId = command.propertyId,
            guestId = command.guestId,
            referenceNumber = generateReferenceNumber(),
            checkIn = command.checkIn,
            checkOut = command.checkOut,
            guestCount = command.guestCount,
            nights = nights,
            nightlyRateEur = priceBreakdown.nightlyRateAsBigDecimal(),
            cleaningFeeEur = priceBreakdown.cleaningFeeAsBigDecimal(),
            serviceFeeEur = priceBreakdown.serviceFeeAsBigDecimal(),
            taxEur = priceBreakdown.taxAsBigDecimal(),
            totalEur = priceBreakdown.totalAsBigDecimal(),
            status = BookingStatus.PENDING,
            stripePaymentIntentId = paymentIntent.id,
            cancellationReason = null,
            cancelledAt = null,
            createdAt = now,
            updatedAt = now,
        )
        val saved = bookingRepository.save(booking)

        return CreateBookingResult(
            bookingId = saved.id,
            referenceNumber = saved.referenceNumber,
            priceBreakdown = priceBreakdown,
            stripeClientSecret = paymentIntent.clientSecret,
            holdExpiresAt = hold.heldUntil,
        )
    }

    private fun round2(value: Double): Double =
        BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).toDouble()

    private fun round2(value: BigDecimal): Double =
        value.setScale(2, RoundingMode.HALF_UP).toDouble()

    /** Format: BK-{YYYYMMDD}-{6 alphanumeric chars}. */
    private fun generateReferenceNumber(): String {
        val datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
        val rand = StringBuilder(6)
        repeat(6) {
            rand.append(REFERENCE_ALPHABET[secureRandom.nextInt(REFERENCE_ALPHABET.length)])
        }
        return "BK-$datePart-$rand"
    }

    companion object {
        private const val SERVICE_FEE_RATE = 0.12
        private const val REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        private val secureRandom = SecureRandom()
    }
}
