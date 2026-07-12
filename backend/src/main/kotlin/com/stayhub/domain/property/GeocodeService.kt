package com.stayhub.domain.property

data class GeocodeResult(
    val name: String,
    val lat: Double,
    val lng: Double,
    val bbox: BoundingBox? = null,
) {
    data class BoundingBox(val swLat: Double, val swLng: Double, val neLat: Double, val neLng: Double)
}

interface GeocodeService {
    suspend fun geocode(query: String): List<GeocodeResult>
}
