package com.stayhub.application.booking

import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.booking.BookingStatus
import com.stayhub.domain.booking.TripCategory
import com.stayhub.domain.common.DomainPageRequest
import com.stayhub.domain.common.PagedResult
import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertyRepository
import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

class GetMyTripsUseCaseTest {

    private val bookingRepository = mockk<BookingRepository>()
    private val propertyRepository = mockk<PropertyRepository>()
    private val useCase = GetMyTripsUseCase(bookingRepository, propertyRepository)

    private val guestId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-000000000001")
    private val propertyId = UUID.fromString("cccccccc-cccc-cccc-cccc-000000001001")

    private val booking = Booking(
        id = UUID.randomUUID(),
        propertyId = propertyId,
        guestId = guestId,
        referenceNumber = "BK-20300101-ABC123",
        checkIn = LocalDate.of(2030, 6, 10),
        checkOut = LocalDate.of(2030, 6, 13),
        guestCount = 2,
        nights = 3,
        nightlyRateEur = BigDecimal("100.00"),
        cleaningFeeEur = BigDecimal("50.00"),
        serviceFeeEur = BigDecimal("36.00"),
        taxEur = BigDecimal("0.00"),
        totalEur = BigDecimal("386.00"),
        status = BookingStatus.CONFIRMED,
        stripePaymentIntentId = "pi_stub_abc",
        cancellationReason = null,
        cancelledAt = null,
        createdAt = Instant.now(),
        updatedAt = Instant.now(),
    )

    private val property = Property(
        id = propertyId,
        hostId = UUID.randomUUID(),
        title = "Cosy Eixample Apartment",
        description = "",
        propertyType = "apartment",
        location = Property.Location(41.39, 2.16, "Barcelona", "Catalonia", "Spain", "Carrer 1"),
        maxGuests = 4,
        bedrooms = 2,
        bathrooms = 1,
        nightlyRateEur = 100.0,
        cleaningFeeEur = 50.0,
        amenities = emptyList(),
        houseRules = emptyList(),
        photos = listOf(Property.Photo("https://img/1.jpg", "front")),
        avgRating = 4.8,
        reviewCount = 12,
    )

    @Test
    fun `maps bookings to enriched summaries with pagination`() {
        runBlocking {
            coEvery {
                bookingRepository.findByGuestIdAndCategory(eq(guestId), eq(TripCategory.UPCOMING), any(), any<DomainPageRequest>())
            } returns PagedResult(listOf(booking), page = 0, size = 10, totalElements = 1L)
            coEvery { propertyRepository.findById(propertyId) } returns property

            val result = useCase.execute(guestId, TripCategory.UPCOMING, page = 1, size = 10)

            result.page shouldBe 1
            result.size shouldBe 10
            result.totalResults shouldBe 1L
            result.totalPages shouldBe 1
            val summary = result.bookings.single()
            summary.referenceNumber shouldBe "BK-20300101-ABC123"
            summary.propertyTitle shouldBe "Cosy Eixample Apartment"
            summary.propertyPhotoUrl shouldBe "https://img/1.jpg"
            summary.city shouldBe "Barcelona"
            summary.status shouldBe BookingStatus.CONFIRMED
            summary.totalEur.compareTo(BigDecimal("386.00")) shouldBe 0
        }
    }

    @Test
    fun `tolerates a missing property with blank enrichment`() {
        runBlocking {
            coEvery {
                bookingRepository.findByGuestIdAndCategory(eq(guestId), any(), any(), any<DomainPageRequest>())
            } returns PagedResult(listOf(booking), page = 0, size = 10, totalElements = 1L)
            coEvery { propertyRepository.findById(propertyId) } returns null

            val result = useCase.execute(guestId, TripCategory.ALL, page = 1, size = 10)

            val summary = result.bookings.single()
            summary.propertyTitle shouldBe ""
            summary.propertyPhotoUrl shouldBe ""
            summary.city shouldBe ""
        }
    }
}
