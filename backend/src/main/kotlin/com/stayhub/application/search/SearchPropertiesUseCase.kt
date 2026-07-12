package com.stayhub.application.search

import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertyRepository
import com.stayhub.domain.property.PropertySearchFilters
import com.stayhub.application.error.ValidationException
import com.stayhub.domain.common.DomainPageRequest
import com.stayhub.domain.common.PagedResult
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.format.DateTimeParseException

@Service
class SearchPropertiesUseCase(
    private val propertyRepository: PropertyRepository,
) {
    suspend fun search(
        swLat: Double,
        swLng: Double,
        neLat: Double,
        neLng: Double,
        checkIn: String,
        checkOut: String,
        filters: PropertySearchFilters,
        page: Int = 1,
        size: Int = 20,
    ): PagedResult<Property> {
        if (swLat >= neLat || swLng >= neLng) {
            throw ValidationException("Invalid bounding box: southwest must be less than northeast")
        }

        val checkInDate = try {
            LocalDate.parse(checkIn)
        } catch (e: DateTimeParseException) {
            throw ValidationException("Invalid check-in date format. Use YYYY-MM-DD")
        }

        val checkOutDate = try {
            LocalDate.parse(checkOut)
        } catch (e: DateTimeParseException) {
            throw ValidationException("Invalid check-out date format. Use YYYY-MM-DD")
        }
        if (checkInDate >= checkOutDate) {
            throw ValidationException("Check-out date must be after check-in date")
        }
        if (checkInDate < LocalDate.now()) {
            throw ValidationException("Check-in date must be in the future")
        }

        val pageable = DomainPageRequest(page - 1, size)
        return propertyRepository.searchByBoundingBox(
            swLat, swLng, neLat, neLng, checkInDate, checkOutDate, filters, pageable,
        )
    }
}
