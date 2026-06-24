package com.stayhub.presentation.api

import com.stayhub.application.property.CalculatePriceUseCase
import com.stayhub.application.property.GetPropertyAvailabilityUseCase
import com.stayhub.application.property.GetPropertyDetailsUseCase
import com.stayhub.application.property.GetPropertyReviewsUseCase
import com.stayhub.domain.property.Host
import com.stayhub.domain.property.HostRepository
import com.stayhub.presentation.dto.property.AvailabilityResponse
import com.stayhub.presentation.dto.property.PriceBreakdownResponse
import com.stayhub.presentation.dto.property.PropertyDetailsResponse
import com.stayhub.presentation.dto.property.ReviewsResponse
import com.stayhub.application.error.ValidationException
import io.swagger.v3.oas.annotations.tags.Tag
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.time.format.DateTimeParseException
import java.util.UUID

@Tag(name = "Properties", description = "Property details, availability, reviews and pricing")
@RestController
@RequestMapping("/api/v1/properties")
class PropertyController(
    private val getPropertyDetailsUseCase: GetPropertyDetailsUseCase,
    private val getPropertyAvailabilityUseCase: GetPropertyAvailabilityUseCase,
    private val calculatePriceUseCase: CalculatePriceUseCase,
    private val getPropertyReviewsUseCase: GetPropertyReviewsUseCase,
    private val hostRepository: HostRepository? = null,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @GetMapping("/{propertyId}")
    suspend fun getPropertyDetails(
        @PathVariable propertyId: UUID,
    ): PropertyDetailsResponse {
        log.info("Get property details: propertyId={}", propertyId)

        val property = getPropertyDetailsUseCase.execute(propertyId)

        // Fetch host info if repository available
        val host: Host? = hostRepository?.findById(property.hostId)

        return PropertyDetailsResponse(
            id = property.id.toString(),
            title = property.title,
            description = property.description,
            property_type = property.propertyType,
            location = PropertyDetailsResponse.LocationDto(
                lat = property.location.lat,
                lng = property.location.lng,
                city = property.location.city,
                region = property.location.region,
                country = property.location.country,
                address = property.location.address,
            ),
            max_guests = property.maxGuests,
            bedrooms = property.bedrooms,
            bathrooms = property.bathrooms,
            nightly_rate_eur = property.nightlyRateEur,
            cleaning_fee_eur = property.cleaningFeeEur,
            amenities = property.amenities,
            house_rules = property.houseRules,
            photos = property.photos.map { photo ->
                PropertyDetailsResponse.PhotoDto(
                    url = photo.url,
                    caption = photo.caption,
                )
            },
            host = PropertyDetailsResponse.HostDto(
                id = host?.id?.toString() ?: property.hostId.toString(),
                first_name = host?.firstName ?: "Host",
                avatar_url = host?.avatarUrl,
                is_verified = host?.isVerified ?: false,
            ),
            avg_rating = property.avgRating,
            review_count = property.reviewCount,
        )
    }

    @GetMapping("/{propertyId}/availability")
    suspend fun getPropertyAvailability(
        @PathVariable propertyId: UUID,
        @RequestParam from: String,
        @RequestParam to: String,
    ): AvailabilityResponse {
        log.info("Get property availability: propertyId={} from={} to={}", propertyId, from, to)

        val fromDate = try {
            LocalDate.parse(from)
        } catch (e: DateTimeParseException) {
            throw ValidationException("Invalid 'from' date format. Use YYYY-MM-DD")
        }

        val toDate = try {
            LocalDate.parse(to)
        } catch (e: DateTimeParseException) {
            throw ValidationException("Invalid 'to' date format. Use YYYY-MM-DD")
        }

        val unavailableDates = getPropertyAvailabilityUseCase.execute(propertyId, fromDate, toDate)

        return AvailabilityResponse(
            property_id = propertyId.toString(),
            unavailable_dates = unavailableDates.map { unavailable ->
                AvailabilityResponse.UnavailableDateDto(
                    date = unavailable.date.toString(),
                    reason = unavailable.reason,
                )
            },
        )
    }

    @GetMapping("/{propertyId}/reviews")
    suspend fun getPropertyReviews(
        @PathVariable propertyId: UUID,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
    ): ReviewsResponse {
        log.info("Get property reviews: propertyId={} page={} size={}", propertyId, page, size)

        val reviewsPage = getPropertyReviewsUseCase.execute(propertyId, page, size)

        val avgRating = if (reviewsPage.totalElements > 0) {
            reviewsPage.content.map { it.rating }.average()
        } else {
            null
        }

        return ReviewsResponse(
            reviews = reviewsPage.content.map { review ->
                ReviewsResponse.ReviewItemDto(
                    id = review.id.toString(),
                    guest_name = review.guestFirstName,
                    guest_avatar_url = review.guestAvatarUrl,
                    rating = review.rating,
                    comment = review.comment,
                    created_at = review.createdAt.toString(),
                )
            },
            pagination = ReviewsResponse.PaginationDto(
                page = reviewsPage.number + 1,
                size = reviewsPage.size,
                total_results = reviewsPage.totalElements,
                total_pages = reviewsPage.totalPages,
            ),
            avg_rating = avgRating,
            total_reviews = reviewsPage.totalElements.toInt(),
        )
    }

    @GetMapping("/{propertyId}/price")
    suspend fun calculatePrice(
        @PathVariable propertyId: UUID,
        @RequestParam check_in: String,
        @RequestParam check_out: String,
        @RequestParam(required = false) guests: Int?,
    ): PriceBreakdownResponse {
        log.info("Calculate price: propertyId={} check_in={} check_out={} guests={}", propertyId, check_in, check_out, guests)

        val checkIn = try {
            LocalDate.parse(check_in)
        } catch (e: DateTimeParseException) {
            throw ValidationException("Invalid 'check_in' date format. Use YYYY-MM-DD")
        }

        val checkOut = try {
            LocalDate.parse(check_out)
        } catch (e: DateTimeParseException) {
            throw ValidationException("Invalid 'check_out' date format. Use YYYY-MM-DD")
        }

        val priceBreakdown = calculatePriceUseCase.execute(propertyId, checkIn, checkOut)

        return PriceBreakdownResponse(
            property_id = priceBreakdown.propertyId.toString(),
            check_in = priceBreakdown.checkIn.toString(),
            check_out = priceBreakdown.checkOut.toString(),
            nights = priceBreakdown.nights,
            nightly_rate_eur = priceBreakdown.nightlyRateEur,
            subtotal_eur = priceBreakdown.subtotalEur,
            cleaning_fee_eur = priceBreakdown.cleaningFeeEur,
            service_fee_eur = priceBreakdown.serviceFeeEur,
            tax_eur = priceBreakdown.taxEur,
            total_eur = priceBreakdown.totalEur,
        )
    }
}
