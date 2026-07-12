package com.stayhub.domain.availability

import java.time.Instant
import java.time.LocalDate
import java.util.UUID

data class AvailabilityHold(
    val id: UUID,
    val propertyId: UUID,
    val guestId: UUID,
    val checkIn: LocalDate,
    val checkOut: LocalDate,
    val heldUntil: Instant,  // expiry — hold is invalid after this
    val createdAt: Instant,
)
