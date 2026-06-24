package com.stayhub.application.search

import com.stayhub.domain.common.DomainPageRequest
import com.stayhub.domain.common.PagedResult
import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertyRepository
import com.stayhub.domain.property.PropertySearchFilters
import com.stayhub.application.error.ValidationException
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.*

class SearchPropertiesUseCaseTest {

    @Test
    fun `searches properties within bounding box`() {
        runBlocking {
            val propertyRepo = mockk<PropertyRepository>()
            val useCase = SearchPropertiesUseCase(propertyRepo)

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
                propertyRepo.searchByBoundingBox(
                    swLat = 41.35,
                    swLng = 2.10,
                    neLat = 41.45,
                    neLng = 2.20,
                    checkIn = LocalDate.parse("2026-07-01"),
                    checkOut = LocalDate.parse("2026-07-05"),
                    filters = PropertySearchFilters(),
                    pageable = DomainPageRequest(0, 20)
                )
            } returns page

            val result = useCase.search(
                swLat = 41.35, swLng = 2.10, neLat = 41.45, neLng = 2.20,
                checkIn = "2026-07-01", checkOut = "2026-07-05",
                filters = PropertySearchFilters(),
                page = 1, size = 20
            )

            result.totalElements shouldBe 1
            result.content[0].title shouldBe "Barcelona Apt"
        }
    }

    @Test
    fun `rejects invalid bounding box`() {
        runBlocking {
            val propertyRepo = mockk<PropertyRepository>()
            val useCase = SearchPropertiesUseCase(propertyRepo)

            shouldThrow<ValidationException> {
                useCase.search(
                    swLat = 41.45, swLng = 2.20, neLat = 41.35, neLng = 2.10,
                    checkIn = "2026-07-01", checkOut = "2026-07-05",
                    filters = PropertySearchFilters(),
                    page = 1, size = 20
                )
            }
        }
    }

    @Test
    fun `rejects invalid date format`() {
        runBlocking {
            val propertyRepo = mockk<PropertyRepository>()
            val useCase = SearchPropertiesUseCase(propertyRepo)

            shouldThrow<ValidationException> {
                useCase.search(
                    swLat = 41.35, swLng = 2.10, neLat = 41.45, neLng = 2.20,
                    checkIn = "not-a-date",  // Invalid format
                    checkOut = "2026-07-05",
                    filters = PropertySearchFilters(),
                    page = 1, size = 20
                )
            }
        }
    }
}
