package com.stayhub.application.booking

import com.stayhub.application.error.ForbiddenException
import com.stayhub.application.error.NotFoundException
import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.booking.BookingStatus
import com.stayhub.domain.property.PropertyRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

class GetBookingDetailsUseCaseTest {

    private val bookingRepository = mockk<BookingRepository>()
    private val propertyRepository = mockk<PropertyRepository>(relaxed = true)
    private val useCase = GetBookingDetailsUseCase(bookingRepository, propertyRepository)

    private val bookingId = UUID.randomUUID()
    private val guestId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-000000000001")

    private fun booking(
        status: BookingStatus = BookingStatus.CONFIRMED,
        guest: UUID = guestId,
        checkIn: LocalDate = LocalDate.now().plusDays(30),
    ) = Booking(
        id = bookingId,
        propertyId = UUID.fromString("cccccccc-cccc-cccc-cccc-000000001001"),
        guestId = guest,
        referenceNumber = "BK-20300101-ABC123",
        checkIn = checkIn,
        checkOut = checkIn.plusDays(3),
        guestCount = 2,
        nights = 3,
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
    fun `throws NotFound when the booking does not exist`() {
        runBlocking {
            coEvery { bookingRepository.findById(bookingId) } returns null
            shouldThrow<NotFoundException> { useCase.execute(bookingId, guestId) }
        }
    }

    @Test
    fun `throws Forbidden when the booking belongs to another guest`() {
        runBlocking {
            coEvery { bookingRepository.findById(bookingId) } returns booking(guest = UUID.randomUUID())
            shouldThrow<ForbiddenException> { useCase.execute(bookingId, guestId) }
        }
    }

    @Test
    fun `confirmed booking far in the future is cancellable with a full refund`() {
        runBlocking {
            coEvery { bookingRepository.findById(bookingId) } returns booking(checkIn = LocalDate.now().plusDays(30))

            val result = useCase.execute(bookingId, guestId)

            result.canCancel shouldBe true
            result.refundAmountEur!!.compareTo(BigDecimal("386.00")) shouldBe 0
        }
    }

    @Test
    fun `confirmed booking within 48h is cancellable but refund is zero`() {
        runBlocking {
            coEvery { bookingRepository.findById(bookingId) } returns booking(checkIn = LocalDate.now().plusDays(1))

            val result = useCase.execute(bookingId, guestId)

            result.canCancel shouldBe true
            result.refundAmountEur!!.compareTo(BigDecimal.ZERO) shouldBe 0
        }
    }

    @Test
    fun `cancelled booking is not cancellable and exposes no refund amount`() {
        runBlocking {
            coEvery { bookingRepository.findById(bookingId) } returns booking(status = BookingStatus.CANCELLED)

            val result = useCase.execute(bookingId, guestId)

            result.canCancel shouldBe false
            result.refundAmountEur.shouldBeNull()
        }
    }
}
