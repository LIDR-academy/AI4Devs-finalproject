package com.stayhub.presentation.api.integration

import org.junit.jupiter.api.Test
import java.time.LocalDate

/**
 * Per-endpoint integration tests for SearchController over the real stack —
 * the real PostGIS bounding-box query runs now that the SearchPropertiesUseCase
 * mock has been removed from TestContainersConfiguration.
 */
class SearchApiIntegrationTest : AbstractApiIntegrationTest() {

    @Test
    fun `search returns 200 with seeded Barcelona results inside the bounding box`() {
        val checkIn = LocalDate.now().plusDays(5)
        val checkOut = checkIn.plusDays(3)
        http.get().uri { b ->
            b.path("/api/v1/properties/search")
                .queryParam("sw_lat", "41.30").queryParam("sw_lng", "2.05")
                .queryParam("ne_lat", "41.50").queryParam("ne_lng", "2.25")
                .queryParam("check_in", "$checkIn").queryParam("check_out", "$checkOut")
                .build()
        }
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.results").isArray
            .jsonPath("$.results[0].id").exists()
            .jsonPath("$.results[0].location.city").isEqualTo("Barcelona")
            .jsonPath("$.pagination.total_results").exists()
    }

    @Test
    fun `search returns 400 for an invalid bounding box`() {
        // sw_lat > ne_lat is not a valid box.
        http.get().uri { b ->
            b.path("/api/v1/properties/search")
                .queryParam("sw_lat", "42.0").queryParam("sw_lng", "2.15")
                .queryParam("ne_lat", "41.0").queryParam("ne_lng", "2.20")
                .queryParam("check_in", "2030-06-01").queryParam("check_out", "2030-06-05")
                .build()
        }
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `geocode returns 200 with matches for a known city`() {
        http.get().uri { b -> b.path("/api/v1/properties/geocode").queryParam("q", "barcelona").build() }
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.results[0].name").exists()
    }
}
