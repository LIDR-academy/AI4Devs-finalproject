package com.stayhub.application.booking

import com.stayhub.application.error.BookingCannotCancelException
import com.stayhub.application.error.ForbiddenException
import com.stayhub.application.error.NotFoundException
import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.booking.PaymentService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

/**
 * Cancels a CONFIRMED booking the calling guest owns, applying the refund
 * policy and issuing a (stub) refund. Dates free up automatically because the
 * booking-conflict check ignores cancelled bookings — no availability write.
 *  - 404 if missing, 403 if not owner, 422 if not CONFIRMED.
 */
@Service
class CancelBookingUseCase(
    private val bookingRepository: BookingRepository,
    private val paymentService: PaymentService,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    suspend fun execute(bookingId: UUID, guestId: UUID, reason: String?): CancellationResult {
        val booking = bookingRepository.findById(bookingId)
            ?: throw NotFoundException("Booking not found: $bookingId")
        if (booking.guestId != guestId) {
            throw ForbiddenException("You do not have access to this booking")
        }
        if (!CancellationPolicy.canCancel(booking)) {
            throw BookingCannotCancelException(
                "Booking $bookingId cannot be cancelled (status=${booking.status.name.lowercase()})"
            )
        }

        val refundAmount = CancellationPolicy.refundAmountEur(booking, Instant.now())
        val fullRefund = refundAmount > BigDecimal.ZERO
        if (fullRefund) {
            paymentService.refund(booking.stripePaymentIntentId, refundAmount)
        }

        val cancelled = bookingRepository.save(booking.cancel(reason))
        log.info("Cancelled booking {} (refund={} full={})", cancelled.id, refundAmount, fullRefund)

        return CancellationResult(
            bookingId = cancelled.id,
            refundAmountEur = refundAmount,
            fullRefund = fullRefund,
        )
    }
}
