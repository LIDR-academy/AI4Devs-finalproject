package com.stayhub.presentation.dto.booking

import jakarta.validation.constraints.Size

/** Optional body for POST /api/v1/bookings/{id}/cancel. */
data class CancelBookingRequest(
    @field:Size(max = 500, message = "reason must be at most 500 characters")
    val reason: String? = null,
)
