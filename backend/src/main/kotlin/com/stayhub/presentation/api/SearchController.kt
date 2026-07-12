package com.stayhub.presentation.api

import com.stayhub.application.search.SearchPropertiesUseCase
import com.stayhub.domain.property.GeocodeService
import com.stayhub.domain.property.PropertySearchFilters
import com.stayhub.presentation.dto.search.*
import com.stayhub.application.error.ValidationException
import io.swagger.v3.oas.annotations.tags.Tag
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.*

@Tag(name = "Search", description = "Geospatial property search and geocoding")
@RestController
@RequestMapping("/api/v1/properties")
class SearchController(
    private val searchUseCase: SearchPropertiesUseCase,
    private val geocodeService: GeocodeService,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @GetMapping("/search")
    suspend fun search(
        @RequestParam sw_lat: Double,
        @RequestParam sw_lng: Double,
        @RequestParam ne_lat: Double,
        @RequestParam ne_lng: Double,
        @RequestParam check_in: String,
        @RequestParam check_out: String,
        @RequestParam(required = false) min_price: Double?,
        @RequestParam(required = false) max_price: Double?,
        @RequestParam(required = false) property_type: String?,
        @RequestParam(required = false) bedrooms: Int?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): SearchResultsResponse {
        // Validate coordinate ranges
        if (sw_lat < -90 || sw_lat > 90) {
            throw ValidationException("sw_lat must be between -90 and 90, got $sw_lat")
        }
        if (sw_lng < -180 || sw_lng > 180) {
            throw ValidationException("sw_lng must be between -180 and 180, got $sw_lng")
        }
        if (ne_lat < -90 || ne_lat > 90) {
            throw ValidationException("ne_lat must be between -90 and 90, got $ne_lat")
        }
        if (ne_lng < -180 || ne_lng > 180) {
            throw ValidationException("ne_lng must be between -180 and 180, got $ne_lng")
        }

        // Validate date format
        if (!check_in.matches(Regex("\\d{4}-\\d{2}-\\d{2}"))) {
            throw ValidationException("check_in format must be YYYY-MM-DD, got $check_in")
        }
        if (!check_out.matches(Regex("\\d{4}-\\d{2}-\\d{2}"))) {
            throw ValidationException("check_out format must be YYYY-MM-DD, got $check_out")
        }

        // Validate prices
        if (min_price != null && min_price < 0) {
            throw ValidationException("min_price must be >= 0, got $min_price")
        }
        if (max_price != null && max_price < 0) {
            throw ValidationException("max_price must be >= 0, got $max_price")
        }

        // Validate pagination
        if (page <= 0) {
            throw ValidationException("page must be > 0, got $page")
        }
        if (size <= 0) {
            throw ValidationException("size must be > 0, got $size")
        }

        log.info(
            "Search request: bbox=[{},{};{},{}] dates=[{},{}] filters={}",
            sw_lat, sw_lng, ne_lat, ne_lng, check_in, check_out,
            "min_price=$min_price, max_price=$max_price, property_type=$property_type, bedrooms=$bedrooms"
        )

        val filters = PropertySearchFilters(
            minPrice = min_price,
            maxPrice = max_price,
            propertyType = property_type,
            bedrooms = bedrooms,
        )
        val result = searchUseCase.search(sw_lat, sw_lng, ne_lat, ne_lng, check_in, check_out, filters, page, size)

        return SearchResultsResponse(
            results = result.content.map {
                PropertySummaryDto(
                    id = it.id.toString(),
                    title = it.title,
                    photo_url = it.photos.firstOrNull()?.url ?: "",
                    nightly_rate_eur = it.nightlyRateEur,
                    cleaning_fee_eur = it.cleaningFeeEur,
                    location = LocationDto(it.location.lat, it.location.lng, it.location.city, it.location.country),
                    avg_rating = it.avgRating,
                    review_count = it.reviewCount,
                    property_type = it.propertyType,
                    max_guests = it.maxGuests,
                    bedrooms = it.bedrooms,
                )
            },
            pagination = PaginationDto(
                page = result.number + 1,
                size = result.size,
                total_results = result.totalElements,
                total_pages = result.totalPages,
            ),
        )
    }

    @GetMapping("/geocode")
    suspend fun geocode(@RequestParam q: String): GeocodeResponse {
        log.info("Geocode request: q={}", q)
        val results = geocodeService.geocode(q)
        return GeocodeResponse(results.map { result ->
            GeocodeResultDto(
                name = result.name,
                lat = result.lat,
                lng = result.lng,
                bbox = result.bbox?.let {
                    BoundingBoxDto(
                        sw_lat = it.swLat,
                        sw_lng = it.swLng,
                        ne_lat = it.neLat,
                        ne_lng = it.neLng
                    )
                }
            )
        })
    }
}
