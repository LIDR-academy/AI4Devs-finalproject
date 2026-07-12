package com.stayhub.domain.availability

import java.time.LocalDate
import java.util.UUID

interface AvailabilityHoldRepository {
    suspend fun createHold(propertyId: UUID, guestId: UUID, checkIn: LocalDate, checkOut: LocalDate): AvailabilityHold
    suspend fun releaseHold(holdId: UUID)
    suspend fun findActiveHoldForDates(propertyId: UUID, checkIn: LocalDate, checkOut: LocalDate): AvailabilityHold?
}
