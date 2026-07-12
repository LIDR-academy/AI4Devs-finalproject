package com.stayhub.presentation.dto.property

data class AvailabilityResponse(
    val property_id: String,
    val unavailable_dates: List<UnavailableDateDto>,
) {
    data class UnavailableDateDto(
        val date: String,
        val reason: String,
    )
}
