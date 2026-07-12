package com.stayhub.domain.property

import java.util.*

data class Property(
    val id: UUID,
    val title: String,
    val description: String,
    val propertyType: String,
    val location: Location,
    val maxGuests: Int,
    val bedrooms: Int,
    val bathrooms: Int,
    val nightlyRateEur: Double,
    val cleaningFeeEur: Double,
    val amenities: List<String>,
    val houseRules: List<String>,
    val photos: List<Photo>,
    val hostId: UUID,
    val avgRating: Double?,
    val reviewCount: Int,
) {
    data class Location(
        val lat: Double,
        val lng: Double,
        val city: String,
        val region: String?,
        val country: String,
        val address: String,
    )

    data class Photo(
        val url: String,
        val caption: String,
    )
}
