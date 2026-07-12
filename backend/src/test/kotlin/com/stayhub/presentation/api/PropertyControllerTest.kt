package com.stayhub.presentation.api

import com.stayhub.application.property.CalculatePriceUseCase
import com.stayhub.application.property.GetPropertyAvailabilityUseCase
import com.stayhub.application.property.GetPropertyDetailsUseCase
import com.stayhub.application.property.GetPropertyReviewsUseCase
import com.stayhub.domain.availability.UnavailableDate
import com.stayhub.domain.common.PagedResult
import com.stayhub.domain.property.PriceBreakdown
import com.stayhub.domain.property.Property
import com.stayhub.domain.review.Review
import com.stayhub.application.error.NotFoundException
import com.stayhub.presentation.middleware.GlobalExceptionHandler
import io.mockk.coEvery
import io.mockk.mockk
import org.junit.jupiter.api.Test
import org.springframework.test.web.reactive.server.WebTestClient
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

class PropertyControllerTest {

    private val getPropertyDetailsUseCase = mockk<GetPropertyDetailsUseCase>()
    private val getPropertyAvailabilityUseCase = mockk<GetPropertyAvailabilityUseCase>()
    private val calculatePriceUseCase = mockk<CalculatePriceUseCase>()
    private val getPropertyReviewsUseCase = mockk<GetPropertyReviewsUseCase>()

    private val controller = PropertyController(
        getPropertyDetailsUseCase,
        getPropertyAvailabilityUseCase,
        calculatePriceUseCase,
        getPropertyReviewsUseCase,
    )

    private val client = WebTestClient.bindToController(controller)
        .controllerAdvice(GlobalExceptionHandler::class.java)
        .build()

    private val propertyId = UUID.fromString("cccccccc-cccc-cccc-cccc-000000001001")
    private val hostId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-000000000001")

    private val sampleProperty = Property(
        id = propertyId,
        title = "Cosy Eixample Apartment",
        description = "A lovely apartment",
        propertyType = "apartment",
        location = Property.Location(41.394, 2.161, "Barcelona", "Catalonia", "Spain", "Carrer de Provença 123"),
        maxGuests = 4,
        bedrooms = 2,
        bathrooms = 1,
        nightlyRateEur = 100.0,
        cleaningFeeEur = 50.0,
        amenities = listOf("WiFi", "AC"),
        houseRules = listOf("No smoking"),
        photos = listOf(Property.Photo(url = "https://example.com/photo.jpg", caption = "Living room")),
        hostId = hostId,
        avgRating = 4.8,
        reviewCount = 12,
    )

    @Test
    fun `GET property details returns 200 with property data`() {
        coEvery { getPropertyDetailsUseCase.execute(propertyId) } returns sampleProperty

        client.get()
            .uri("/api/v1/properties/$propertyId")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(propertyId.toString())
            .jsonPath("$.title").isEqualTo("Cosy Eixample Apartment")
            .jsonPath("$.property_type").isEqualTo("apartment")
            .jsonPath("$.location.city").isEqualTo("Barcelona")
            .jsonPath("$.max_guests").isEqualTo(4)
    }

    @Test
    fun `GET property details returns 404 when not found`() {
        val unknownId = UUID.randomUUID()
        coEvery { getPropertyDetailsUseCase.execute(unknownId) } throws NotFoundException("Property not found")

        client.get()
            .uri("/api/v1/properties/$unknownId")
            .exchange()
            .expectStatus().isNotFound
            .expectBody()
            .jsonPath("$.error.code").isEqualTo("NOT_FOUND")
    }

    @Test
    fun `GET property availability returns 200 with unavailable dates`() {
        val from = LocalDate.of(2027, 7, 1)
        val to = LocalDate.of(2027, 7, 31)
        val unavailable = listOf(
            UnavailableDate(date = LocalDate.of(2027, 7, 10), reason = "booked"),
            UnavailableDate(date = LocalDate.of(2027, 7, 20), reason = "blocked"),
        )

        coEvery { getPropertyAvailabilityUseCase.execute(propertyId, from, to) } returns unavailable

        client.get()
            .uri("/api/v1/properties/$propertyId/availability?from=2027-07-01&to=2027-07-31")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.property_id").isEqualTo(propertyId.toString())
            .jsonPath("$.unavailable_dates[0].date").isEqualTo("2027-07-10")
            .jsonPath("$.unavailable_dates[0].reason").isEqualTo("booked")
            .jsonPath("$.unavailable_dates[1].reason").isEqualTo("blocked")
    }

    @Test
    fun `GET property reviews returns 200 with empty list when no reviews`() {
        val page = PagedResult(emptyList<Review>(), page = 0, size = 10, totalElements = 0L)
        coEvery { getPropertyReviewsUseCase.execute(propertyId, 1, 10) } returns page

        client.get()
            .uri("/api/v1/properties/$propertyId/reviews")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.reviews").isArray
            .jsonPath("$.total_reviews").isEqualTo(0)
            .jsonPath("$.avg_rating").doesNotExist()
    }

    @Test
    fun `GET property reviews returns 200 with reviews`() {
        val reviewId = UUID.randomUUID()
        val guestId = UUID.randomUUID()
        val bookingId = UUID.randomUUID()
        val review = Review(
            id = reviewId,
            propertyId = propertyId,
            guestId = guestId,
            bookingId = bookingId,
            rating = 5,
            comment = "Amazing stay!",
            createdAt = Instant.parse("2027-01-15T10:00:00Z"),
            guestFirstName = "Alice",
            guestAvatarUrl = null,
        )
        val page = PagedResult(listOf(review), page = 0, size = 10, totalElements = 1L)
        coEvery { getPropertyReviewsUseCase.execute(propertyId, 1, 10) } returns page

        client.get()
            .uri("/api/v1/properties/$propertyId/reviews")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.reviews[0].id").isEqualTo(reviewId.toString())
            .jsonPath("$.reviews[0].guest_name").isEqualTo("Alice")
            .jsonPath("$.reviews[0].rating").isEqualTo(5)
            .jsonPath("$.total_reviews").isEqualTo(1)
            .jsonPath("$.pagination.total_results").isEqualTo(1)
    }

    @Test
    fun `GET property price returns 200 with price breakdown`() {
        val checkIn = LocalDate.of(2027, 7, 1)
        val checkOut = LocalDate.of(2027, 7, 4)
        val priceBreakdown = PriceBreakdown(
            propertyId = propertyId,
            checkIn = checkIn,
            checkOut = checkOut,
            nights = 3,
            nightlyRateEur = 100.0,
            subtotalEur = 300.0,
            cleaningFeeEur = 50.0,
            serviceFeeEur = 36.0,
            taxEur = 0.0,
            totalEur = 386.0,
        )

        coEvery { calculatePriceUseCase.execute(propertyId, checkIn, checkOut) } returns priceBreakdown

        client.get()
            .uri("/api/v1/properties/$propertyId/price?check_in=2027-07-01&check_out=2027-07-04&guests=2")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.property_id").isEqualTo(propertyId.toString())
            .jsonPath("$.nights").isEqualTo(3)
            .jsonPath("$.nightly_rate_eur").isEqualTo(100.0)
            .jsonPath("$.subtotal_eur").isEqualTo(300.0)
            .jsonPath("$.cleaning_fee_eur").isEqualTo(50.0)
            .jsonPath("$.service_fee_eur").isEqualTo(36.0)
            .jsonPath("$.tax_eur").isEqualTo(0.0)
            .jsonPath("$.total_eur").isEqualTo(386.0)
    }

    @Test
    fun `GET property price returns 400 for invalid dates`() {
        client.get()
            .uri("/api/v1/properties/$propertyId/price?check_in=invalid&check_out=2027-07-04&guests=2")
            .exchange()
            .expectStatus().isBadRequest
    }
}
