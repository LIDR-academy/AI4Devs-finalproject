package com.stayhub.infrastructure.geocoding

import com.stayhub.domain.property.GeocodeResult
import com.stayhub.domain.property.GeocodeService
import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class MapboxGeocodeAdapter(
    @Value("\${mapbox.api-key:default-token}")
    private val apiKey: String,
) : GeocodeService {
    private val logger = LoggerFactory.getLogger(javaClass)

    @PostConstruct
    fun validateConfiguration() {
        if (apiKey.isBlank() || apiKey == "default-token") {
            throw IllegalStateException(
                "Mapbox API key is not configured. " +
                "Please set 'mapbox.api-key' in application properties. " +
                "This is required for geocoding functionality."
            )
        }
    }

    override suspend fun geocode(query: String): List<GeocodeResult> {
        // Validate query parameter
        if (query.isBlank()) {
            logger.warn("Geocode query is blank")
            return emptyList()
        }

        if (query.length > 256) {
            logger.warn("Geocode query exceeds maximum length of 256 characters: length={}", query.length)
            return emptyList()
        }

        logger.info("Geocoding query: {}", query)

        // Hardcoded results for demo cities — enables Phase 3 search by location
        // Real implementation: T026 (Phase 2 - integrate Mapbox Geocoding API v5)
        val demoLocations = mapOf(
            "barcelona" to GeocodeResult(
                name = "Barcelona, Spain",
                lat = 41.3851,
                lng = 2.1734,
                bbox = GeocodeResult.BoundingBox(swLat = 40.0, swLng = 2.0, neLat = 42.0, neLng = 4.0)
            ),
            "madrid" to GeocodeResult(
                name = "Madrid, Spain",
                lat = 40.4168,
                lng = -3.7038,
                bbox = GeocodeResult.BoundingBox(swLat = 40.0, swLng = -3.5, neLat = 40.5, neLng = -3.0)
            ),
            "lisbon" to GeocodeResult(
                name = "Lisbon, Portugal",
                lat = 38.7223,
                lng = -9.1393,
                bbox = GeocodeResult.BoundingBox(swLat = 38.6, swLng = -9.2, neLat = 38.8, neLng = -9.0)
            ),
            "paris" to GeocodeResult(
                name = "Paris, France",
                lat = 48.8566,
                lng = 2.3522,
                bbox = GeocodeResult.BoundingBox(swLat = 48.7, swLng = 2.2, neLat = 48.9, neLng = 2.5)
            ),
        )

        val lowerQuery = query.lowercase()
        return demoLocations.filterKeys { it.contains(lowerQuery) || lowerQuery.contains(it) }
            .values.toList()
    }
}
