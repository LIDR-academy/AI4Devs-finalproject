package com.stayhub.domain.booking

import com.stayhub.domain.common.DomainPageRequest
import com.stayhub.domain.common.PagedResult
import java.time.LocalDate
import java.util.UUID

/**
 * Domain port for Booking persistence.
 *
 * Implementations live in the infrastructure layer and must carry the
 * Spring @Repository annotation there — this interface intentionally has
 * no Spring stereotypes so the domain remains framework-free.
 */
interface BookingRepository {
    suspend fun save(booking: Booking): Booking
    suspend fun findById(id: UUID): Booking?
    suspend fun findByGuestId(guestId: UUID, pageable: DomainPageRequest): PagedResult<Booking>
    suspend fun findByGuestIdAndCategory(
        guestId: UUID,
        category: TripCategory,
        today: LocalDate,
        pageable: DomainPageRequest,
    ): PagedResult<Booking>
    suspend fun findByPropertyAndDates(propertyId: UUID, checkIn: LocalDate, checkOut: LocalDate): List<Booking>
}
