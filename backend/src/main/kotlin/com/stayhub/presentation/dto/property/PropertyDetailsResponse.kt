package com.stayhub.presentation.dto.property

import com.fasterxml.jackson.annotation.JsonProperty

data class PropertyDetailsResponse(
    val id: String,
    val title: String,
    val description: String,
    val property_type: String,
    val location: LocationDto,
    val max_guests: Int,
    val bedrooms: Int,
    val bathrooms: Int,
    val nightly_rate_eur: Double,
    val cleaning_fee_eur: Double,
    val amenities: List<String>,
    val house_rules: List<String>,
    val photos: List<PhotoDto>,
    val host: HostDto,
    val avg_rating: Double?,
    val review_count: Int,
) {
    data class LocationDto(
        val lat: Double,
        val lng: Double,
        val city: String,
        val region: String?,
        val country: String,
        val address: String,
    )

    data class PhotoDto(
        val url: String,
        val caption: String,
    )

    data class HostDto(
        val id: String,
        val first_name: String,
        val avatar_url: String?,
        @get:JsonProperty("is_verified")
        val is_verified: Boolean,
    )
}
