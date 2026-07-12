package com.stayhub.presentation.api

import com.stayhub.application.search.SearchPropertiesUseCase
import com.stayhub.domain.common.PagedResult
import com.stayhub.domain.property.GeocodeService
import com.stayhub.domain.property.GeocodeResult
import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertySearchFilters
import com.stayhub.application.error.ValidationException
import com.stayhub.presentation.middleware.GlobalExceptionHandler
import io.mockk.coEvery
import io.mockk.mockk
import org.junit.jupiter.api.Test
import org.springframework.test.web.reactive.server.WebTestClient
import java.util.*

class SearchControllerTest {
    private val searchUseCase = mockk<SearchPropertiesUseCase>()
    private val geocodeService = mockk<GeocodeService>()
    private val controller = SearchController(searchUseCase, geocodeService)
    private val client = WebTestClient.bindToController(controller)
        .controllerAdvice(GlobalExceptionHandler::class.java)
        .build()

    @Test
    fun `GET search returns paginated properties`() {
        val mockProperty = Property(
            id = UUID.randomUUID(),
            title = "Barcelona Apt",
            description = "Nice",
            propertyType = "apartment",
            location = Property.Location(41.4, 2.16, "Barcelona", null, "Spain", "Main St"),
            maxGuests = 4,
            bedrooms = 2,
            bathrooms = 1,
            nightlyRateEur = 120.0,
            cleaningFeeEur = 50.0,
            amenities = listOf("WiFi"),
            houseRules = emptyList(),
            photos = emptyList(),
            hostId = UUID.randomUUID(),
            avgRating = 4.8,
            reviewCount = 10
        )
        val page = PagedResult(listOf(mockProperty), page = 0, size = 20, totalElements = 1L)

        coEvery {
            searchUseCase.search(
                swLat = 41.35,
                swLng = 2.10,
                neLat = 41.45,
                neLng = 2.20,
                checkIn = "2025-06-01",
                checkOut = "2025-06-05",
                filters = any(),
                page = 1,
                size = 20
            )
        } returns page

        client.get()
            .uri("/api/v1/properties/search?sw_lat=41.35&sw_lng=2.10&ne_lat=41.45&ne_lng=2.20&check_in=2025-06-01&check_out=2025-06-05")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.results[0].title").isEqualTo("Barcelona Apt")
            .jsonPath("$.pagination.total_results").isEqualTo(1)
    }

    @Test
    fun `GET search with invalid latitude rejects with 400`() {
        client.get()
            .uri("/api/v1/properties/search?sw_lat=999&sw_lng=2.10&ne_lat=41.45&ne_lng=2.20&check_in=2025-06-01&check_out=2025-06-05")
            .exchange()
            .expectStatus().isBadRequest
            .expectBody()
            .jsonPath("$.error.code").isEqualTo("VALIDATION_ERROR")
    }

    @Test
    fun `GET search with invalid longitude rejects with 400`() {
        client.get()
            .uri("/api/v1/properties/search?sw_lat=41.35&sw_lng=999&ne_lat=41.45&ne_lng=2.20&check_in=2025-06-01&check_out=2025-06-05")
            .exchange()
            .expectStatus().isBadRequest
            .expectBody()
            .jsonPath("$.error.code").isEqualTo("VALIDATION_ERROR")
    }

    @Test
    fun `GET search with invalid date format rejects with 400`() {
        client.get()
            .uri("/api/v1/properties/search?sw_lat=41.35&sw_lng=2.10&ne_lat=41.45&ne_lng=2.20&check_in=not-a-date&check_out=2025-06-05")
            .exchange()
            .expectStatus().isBadRequest
            .expectBody()
            .jsonPath("$.error.code").isEqualTo("VALIDATION_ERROR")
    }

    @Test
    fun `GET search with negative price rejects with 400`() {
        client.get()
            .uri("/api/v1/properties/search?sw_lat=41.35&sw_lng=2.10&ne_lat=41.45&ne_lng=2.20&check_in=2025-06-01&check_out=2025-06-05&min_price=-10")
            .exchange()
            .expectStatus().isBadRequest
            .expectBody()
            .jsonPath("$.error.code").isEqualTo("VALIDATION_ERROR")
    }

    @Test
    fun `GET search with invalid page rejects with 400`() {
        client.get()
            .uri("/api/v1/properties/search?sw_lat=41.35&sw_lng=2.10&ne_lat=41.45&ne_lng=2.20&check_in=2025-06-01&check_out=2025-06-05&page=0")
            .exchange()
            .expectStatus().isBadRequest
            .expectBody()
            .jsonPath("$.error.code").isEqualTo("VALIDATION_ERROR")
    }

    @Test
    fun `GET search handles ValidationException from use case as 400`() {
        coEvery {
            searchUseCase.search(
                swLat = 41.35,
                swLng = 2.10,
                neLat = 41.35,
                neLng = 2.10,
                checkIn = "2025-06-01",
                checkOut = "2025-06-05",
                filters = any(),
                page = 1,
                size = 20
            )
        } throws ValidationException("Invalid bounding box: southwest must be less than northeast")

        client.get()
            .uri("/api/v1/properties/search?sw_lat=41.35&sw_lng=2.10&ne_lat=41.35&ne_lng=2.10&check_in=2025-06-01&check_out=2025-06-05")
            .exchange()
            .expectStatus().isBadRequest
            .expectBody()
            .jsonPath("$.error.code").isEqualTo("VALIDATION_ERROR")
            .jsonPath("$.error.message").value { it: Any -> (it as String).contains("Invalid bounding box") }
    }

    @Test
    fun `GET geocode returns typed results`() {
        val bbox = GeocodeResult.BoundingBox(40.0, 1.0, 42.0, 3.0)
        val geocodeResult = GeocodeResult(
            name = "Barcelona",
            lat = 41.4,
            lng = 2.16,
            bbox = bbox
        )

        coEvery {
            geocodeService.geocode("Barcelona")
        } returns listOf(geocodeResult)

        client.get()
            .uri("/api/v1/properties/geocode?q=Barcelona")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.results[0].name").isEqualTo("Barcelona")
            .jsonPath("$.results[0].lat").isEqualTo(41.4)
            .jsonPath("$.results[0].lng").isEqualTo(2.16)
            .jsonPath("$.results[0].bbox.sw_lat").isEqualTo(40.0)
            .jsonPath("$.results[0].bbox.sw_lng").isEqualTo(1.0)
            .jsonPath("$.results[0].bbox.ne_lat").isEqualTo(42.0)
            .jsonPath("$.results[0].bbox.ne_lng").isEqualTo(3.0)
    }

    @Test
    fun `GET geocode handles null bbox`() {
        val geocodeResult = GeocodeResult(
            name = "Barcelona",
            lat = 41.4,
            lng = 2.16,
            bbox = null
        )

        coEvery {
            geocodeService.geocode("Barcelona")
        } returns listOf(geocodeResult)

        client.get()
            .uri("/api/v1/properties/geocode?q=Barcelona")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.results[0].name").isEqualTo("Barcelona")
            .jsonPath("$.results[0].bbox").doesNotExist()
    }
}
