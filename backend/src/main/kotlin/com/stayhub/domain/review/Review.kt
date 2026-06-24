package com.stayhub.domain.review

import java.time.Instant
import java.util.UUID

data class Review(
    val id: UUID,
    val propertyId: UUID,
    val guestId: UUID,
    val bookingId: UUID,
    val rating: Int,
    val comment: String?,
    val createdAt: Instant,
    val guestFirstName: String,
    val guestAvatarUrl: String?,
)
