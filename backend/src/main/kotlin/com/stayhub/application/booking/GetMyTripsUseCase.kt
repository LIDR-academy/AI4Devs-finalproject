package com.stayhub.application.booking

import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.booking.TripCategory
import com.stayhub.domain.common.DomainPageRequest
import com.stayhub.domain.property.PropertyRepository
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.UUID

/**
 * Lists the authenticated guest's bookings for the requested [TripCategory],
 * paginated, enriching each with its property's title/photo/city for the
 * summary card. `page` is 1-based (contract); converted to a 0-based PageRequest.
 */
@Service
class GetMyTripsUseCase(
    private val bookingRepository: BookingRepository,
    private val propertyRepository: PropertyRepository,
) {
    suspend fun execute(guestId: UUID, category: TripCategory, page: Int, size: Int): MyTripsResult {
        val pageable = DomainPageRequest(page - 1, size)
        val result = bookingRepository.findByGuestIdAndCategory(guestId, category, LocalDate.now(), pageable)

        val summaries = result.content.map { booking ->
            val property = runCatching { propertyRepository.findById(booking.propertyId) }.getOrNull()
            TripSummary(
                id = booking.id,
                referenceNumber = booking.referenceNumber,
                propertyTitle = property?.title ?: "",
                propertyPhotoUrl = property?.photos?.firstOrNull()?.url ?: "",
                city = property?.location?.city ?: "",
                checkIn = booking.checkIn,
                checkOut = booking.checkOut,
                status = booking.status,
                totalEur = booking.totalEur,
            )
        }

        return MyTripsResult(
            bookings = summaries,
            page = page,
            size = size,
            totalResults = result.totalElements,
            totalPages = result.totalPages,
        )
    }
}
