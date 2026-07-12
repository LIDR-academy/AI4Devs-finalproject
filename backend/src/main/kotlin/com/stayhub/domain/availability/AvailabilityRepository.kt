package com.stayhub.domain.availability

import java.time.LocalDate
import java.util.UUID

interface AvailabilityRepository {
    suspend fun findUnavailableDates(
        propertyId: UUID,
        from: LocalDate,
        to: LocalDate,
    ): List<UnavailableDate>
}
