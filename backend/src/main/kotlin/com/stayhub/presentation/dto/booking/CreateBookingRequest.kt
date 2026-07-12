package com.stayhub.presentation.dto.booking

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull
import java.time.LocalDate
import java.util.UUID

/**
 * Request body for POST /api/v1/bookings.  Field names are snake_case to match
 * the OpenAPI contract; Jackson maps them via the Kotlin module without needing
 * explicit @JsonProperty annotations.
 */
data class CreateBookingRequest(
    @field:NotNull(message = "property_id is required")
    val property_id: UUID? = null,
    @field:NotNull(message = "check_in is required")
    val check_in: LocalDate? = null,
    @field:NotNull(message = "check_out is required")
    val check_out: LocalDate? = null,
    @field:Min(value = 1, message = "guest_count must be >= 1")
    val guest_count: Int = 1,
)
