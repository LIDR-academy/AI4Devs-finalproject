package com.stayhub.application.property

import com.stayhub.domain.availability.AvailabilityRepository
import com.stayhub.domain.availability.UnavailableDate
import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.booking.BookingStatus
import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertyRepository
import com.stayhub.application.error.NotFoundException
import com.stayhub.application.error.ValidationException
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

class GetPropertyAvailabilityUseCaseTest {

    private val availabilityRepository = mockk<AvailabilityRepository>()
    private val propertyRepository = mockk<PropertyRepository>()
    private val bookingRepository = mockk<BookingRepository>()
    private val useCase = GetPropertyAvailabilityUseCase(availabilityRepository, propertyRepository, bookingRepository)

    private val propertyId = UUID.randomUUID()
    private val stubProperty = mockk<Property>()

    @BeforeEach
    fun setUpBookingRepositoryDefault() {
        coEvery { bookingRepository.findByPropertyAndDates(any(), any(), any()) } returns emptyList()
    }

    private fun booking(
        pid: UUID = propertyId,
        checkIn: LocalDate = LocalDate.now().plusDays(30),
        checkOut: LocalDate = checkIn.plusDays(3),
        status: BookingStatus = BookingStatus.CONFIRMED,
    ) = Booking(
        id = UUID.randomUUID(),
        propertyId = pid,
        guestId = UUID.randomUUID(),
        referenceNumber = "BK-20300101-ABC123",
        checkIn = checkIn,
        checkOut = checkOut,
        guestCount = 2,
        nights = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut).toInt(),
        nightlyRateEur = BigDecimal("100.00"),
        cleaningFeeEur = BigDecimal("50.00"),
        serviceFeeEur = BigDecimal("36.00"),
        taxEur = BigDecimal("0.00"),
        totalEur = BigDecimal("386.00"),
        status = status,
        stripePaymentIntentId = "pi_stub_abc",
        cancellationReason = null,
        cancelledAt = null,
        createdAt = Instant.now(),
        updatedAt = Instant.now(),
    )

    @Test
    fun `returns unavailable dates for a valid date range`() {
        runBlocking {
            val from = LocalDate.of(2027, 7, 1)
            val to = LocalDate.of(2027, 7, 31)
            val unavailable = listOf(
                UnavailableDate(date = LocalDate.of(2027, 7, 10), reason = "booked"),
                UnavailableDate(date = LocalDate.of(2027, 7, 11), reason = "booked"),
                UnavailableDate(date = LocalDate.of(2027, 7, 20), reason = "blocked"),
            )

            coEvery { propertyRepository.findById(propertyId) } returns stubProperty
            coEvery { availabilityRepository.findUnavailableDates(propertyId, from, to) } returns unavailable

            val result = useCase.execute(propertyId, from, to)

            result shouldHaveSize 3
            result[0].reason shouldBe "booked"
        }
    }

    @Test
    fun `throws ValidationException when from is after to`() {
        runBlocking {
            val from = LocalDate.of(2027, 8, 1)
            val to = LocalDate.of(2027, 7, 1)

            shouldThrow<ValidationException> {
                useCase.execute(propertyId, from, to)
            }
        }
    }

    @Test
    fun `throws ValidationException when from equals to`() {
        runBlocking {
            val date = LocalDate.of(2027, 7, 1)

            shouldThrow<ValidationException> {
                useCase.execute(propertyId, date, date)
            }
        }
    }

    @Test
    fun `returns empty list when no unavailable dates in range`() {
        runBlocking {
            val from = LocalDate.of(2027, 7, 1)
            val to = LocalDate.of(2027, 7, 31)

            coEvery { propertyRepository.findById(propertyId) } returns stubProperty
            coEvery { availabilityRepository.findUnavailableDates(propertyId, from, to) } returns emptyList()

            val result = useCase.execute(propertyId, from, to)

            result shouldHaveSize 0
        }
    }

    @Test
    fun `throws NotFoundException when property does not exist`() {
        runBlocking {
            val from = LocalDate.of(2027, 7, 1)
            val to = LocalDate.of(2027, 7, 31)

            coEvery { propertyRepository.findById(propertyId) } returns null

            shouldThrow<NotFoundException> {
                useCase.execute(propertyId, from, to)
            }
        }
    }

    @Test
    fun `confirmed booking nights appear as booked in availability result`() {
        runBlocking {
            val from = LocalDate.of(2026, 7, 18)
            val to = LocalDate.of(2026, 7, 26)
            val checkIn = LocalDate.of(2026, 7, 20)
            val checkOut = LocalDate.of(2026, 7, 23)

            coEvery { propertyRepository.findById(propertyId) } returns stubProperty
            coEvery { availabilityRepository.findUnavailableDates(propertyId, from, to) } returns emptyList()
            coEvery { bookingRepository.findByPropertyAndDates(propertyId, from, to) } returns listOf(
                booking(checkIn = checkIn, checkOut = checkOut, status = BookingStatus.CONFIRMED)
            )

            val result = useCase.execute(propertyId, from, to)

            // Nights [checkIn, checkOut) = 2026-07-20, 2026-07-21, 2026-07-22
            val dates = result.map { it.date }
            dates.contains(LocalDate.of(2026, 7, 20)) shouldBe true
            dates.contains(LocalDate.of(2026, 7, 21)) shouldBe true
            dates.contains(LocalDate.of(2026, 7, 22)) shouldBe true
            // checkout night is free
            dates.contains(LocalDate.of(2026, 7, 23)) shouldBe false
            result.filter { it.date == LocalDate.of(2026, 7, 20) }.first().reason shouldBe "booked"
            result.filter { it.date == LocalDate.of(2026, 7, 21) }.first().reason shouldBe "booked"
            result.filter { it.date == LocalDate.of(2026, 7, 22) }.first().reason shouldBe "booked"
        }
    }

    @Test
    fun `booking nights overlapping a blocked date are deduped to a single entry`() {
        runBlocking {
            val from = LocalDate.of(2026, 7, 18)
            val to = LocalDate.of(2026, 7, 26)
            val checkIn = LocalDate.of(2026, 7, 20)
            val checkOut = LocalDate.of(2026, 7, 23)
            val blockedDate = LocalDate.of(2026, 7, 21)

            coEvery { propertyRepository.findById(propertyId) } returns stubProperty
            coEvery { availabilityRepository.findUnavailableDates(propertyId, from, to) } returns listOf(
                UnavailableDate(date = blockedDate, reason = "blocked")
            )
            coEvery { bookingRepository.findByPropertyAndDates(propertyId, from, to) } returns listOf(
                booking(checkIn = checkIn, checkOut = checkOut, status = BookingStatus.CONFIRMED)
            )

            val result = useCase.execute(propertyId, from, to)

            // Should not have a duplicate for 2026-07-21
            result.count { it.date == blockedDate } shouldBe 1
        }
    }
}
