package com.stayhub.application.booking

import com.stayhub.application.error.ForbiddenException
import com.stayhub.application.error.NotFoundException
import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.property.PropertyRepository
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

/**
 * Returns full detail for a booking the calling guest owns, computing
 * `canCancel` and the would-be refund per [CancellationPolicy].
 *  - 404 if the booking is missing.
 *  - 403 if it belongs to another guest.
 */
@Service
class GetBookingDetailsUseCase(
    private val bookingRepository: BookingRepository,
    private val propertyRepository: PropertyRepository,
) {
    suspend fun execute(bookingId: UUID, guestId: UUID): BookingDetailResult {
        val booking = bookingRepository.findById(bookingId)
            ?: throw NotFoundException("Booking not found: $bookingId")
        if (booking.guestId != guestId) {
            throw ForbiddenException("You do not have access to this booking")
        }

        val property = runCatching { propertyRepository.findById(booking.propertyId) }.getOrNull()
        val canCancel = CancellationPolicy.canCancel(booking)
        val refundAmountEur = if (canCancel) CancellationPolicy.refundAmountEur(booking, Instant.now()) else null

        return BookingDetailResult(booking, property, canCancel, refundAmountEur)
    }
}
