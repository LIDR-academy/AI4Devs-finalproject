package com.stayhub.presentation.dto.search

data class SearchResultsResponse(
    val results: List<PropertySummaryDto>,
    val pagination: PaginationDto,
)

data class PropertySummaryDto(
    val id: String,
    val title: String,
    val photo_url: String,
    val nightly_rate_eur: Double,
    val cleaning_fee_eur: Double,
    val location: LocationDto,
    val avg_rating: Double?,
    val review_count: Int,
    val property_type: String,
    val max_guests: Int,
    val bedrooms: Int,
)

data class LocationDto(
    val lat: Double,
    val lng: Double,
    val city: String,
    val country: String,
)

data class PaginationDto(
    val page: Int,
    val size: Int,
    val total_results: Long,
    val total_pages: Int,
)

data class BoundingBoxDto(
    val sw_lat: Double,
    val sw_lng: Double,
    val ne_lat: Double,
    val ne_lng: Double,
)

data class GeocodeResultDto(
    val name: String,
    val lat: Double,
    val lng: Double,
    val bbox: BoundingBoxDto?,
)

data class GeocodeResponse(val results: List<GeocodeResultDto>)
