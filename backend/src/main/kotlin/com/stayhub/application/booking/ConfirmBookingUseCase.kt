package com.stayhub.application.booking

import com.stayhub.application.error.ForbiddenException
import com.stayhub.application.error.NotFoundException
import com.stayhub.application.error.PaymentFailedException
import com.stayhub.domain.availability.AvailabilityHoldRepository
import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingConfirmation
import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.booking.EmailNotificationService
import com.stayhub.domain.booking.PaymentService
import com.stayhub.domain.booking.PaymentStatus
import com.stayhub.domain.property.PropertyRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

/**
 * Confirms a PENDING booking after the frontend signals that the Stripe
 * PaymentIntent has succeeded.
 *
 * Order of operations:
 *  1. Load booking — 404 if missing.
 *  2. Authorize: booking must belong to the calling guest — 403 otherwise.
 *  3. Verify the PaymentIntent reached SUCCEEDED status — PaymentFailedException
 *     (mapped to 400) otherwise.
 *  4. booking.confirm() (PENDING → CONFIRMED) and persist.
 *  5. Release the active availability hold (if any) — failure is non-fatal.
 *  6. Fire-and-forget booking confirmation email.
 */
@Service
class ConfirmBookingUseCase(
    private val bookingRepository: BookingRepository,
    private val holdRepository: AvailabilityHoldRepository,
    private val paymentService: PaymentService,
    private val emailService: EmailNotificationService,
    private val propertyRepository: PropertyRepository,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    // Dedicated supervisor scope for fire-and-forget side effects (email).
    // SupervisorJob so a child failure doesn't cancel siblings or the scope.
    private val backgroundScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    suspend fun execute(bookingId: UUID, paymentIntentId: String, guestId: UUID): Booking {
        val booking = bookingRepository.findById(bookingId)
            ?: throw NotFoundException("Booking not found: $bookingId")

        if (booking.guestId != guestId) {
            throw ForbiddenException("You do not have access to this booking")
        }

        val status = paymentService.getPaymentStatus(paymentIntentId)
        if (status != PaymentStatus.SUCCEEDED) {
            throw PaymentFailedException(
                "Payment intent $paymentIntentId is not in SUCCEEDED state (was $status)"
            )
        }

        val confirmed = bookingRepository.save(booking.confirm())

        // Release active hold (if any). Failure here should not undo the
        // confirmed booking — log and move on.
        runCatching {
            val hold = holdRepository.findActiveHoldForDates(
                confirmed.propertyId,
                confirmed.checkIn,
                confirmed.checkOut,
            )
            if (hold != null) {
                holdRepository.releaseHold(hold.id)
            }
        }.onFailure { log.warn("Failed to release hold for booking {}: {}", confirmed.id, it.message) }

        // Fire-and-forget confirmation email.
        backgroundScope.launch {
            runCatching { sendConfirmationEmail(confirmed) }
                .onFailure {
                    log.warn(
                        "Failed to send booking confirmation email for {}: {}",
                        confirmed.id,
                        it.message,
                    )
                }
        }

        return confirmed
    }

    private suspend fun sendConfirmationEmail(booking: Booking) {
        val property = propertyRepository.findById(booking.propertyId)
        emailService.sendBookingConfirmation(
            BookingConfirmation(
                bookingId = booking.id,
                referenceNumber = booking.referenceNumber,
                // V1: guest contact details aren't stored in domain — placeholders.
                // Slice F (US3 follow-up) will read them from the user store.
                guestEmail = "guest+${booking.guestId}@stayhub.invalid",
                guestFirstName = "Guest",
                propertyTitle = property?.title ?: "Your stay",
                checkIn = booking.checkIn,
                checkOut = booking.checkOut,
                nights = booking.nights,
                totalEur = booking.totalEur,
            ),
        )
    }
}
