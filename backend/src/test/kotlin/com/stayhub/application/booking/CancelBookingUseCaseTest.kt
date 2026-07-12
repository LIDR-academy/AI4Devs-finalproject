package com.stayhub.application.booking

import com.stayhub.application.error.BookingCannotCancelException
import com.stayhub.application.error.ForbiddenException
import com.stayhub.application.error.NotFoundException
import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.booking.BookingStatus
import com.stayhub.domain.booking.RefundResult
import com.stayhub.domain.booking.PaymentService
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import io.mockk.slot
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

class CancelBookingUseCaseTest {

    private val bookingRepository = mockk<BookingRepository>()
    private val paymentService = mockk<PaymentService>()
    private val useCase = CancelBookingUseCase(bookingRepository, paymentService)

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
    fun `cancels a far-future confirmed booking with a full refund`() {
        runBlocking {
            coEvery { bookingRepository.findById(bookingId) } returns booking(checkIn = LocalDate.now().plusDays(30))
            coEvery { paymentService.refund("pi_stub_abc", any()) } returns RefundResult("re_stub_1", BigDecimal("386.00"))
            val saved = slot<Booking>()
            coEvery { bookingRepository.save(capture(saved)) } answers { saved.captured }

            val result = useCase.execute(bookingId, guestId, reason = "change of plans")

            result.fullRefund shouldBe true
            result.refundAmountEur.compareTo(BigDecimal("386.00")) shouldBe 0
            saved.captured.status shouldBe BookingStatus.CANCELLED
            saved.captured.cancellationReason shouldBe "change of plans"
            coVerify(exactly = 1) { paymentService.refund("pi_stub_abc", any()) }
        }
    }

    @Test
    fun `cancels a within-48h confirmed booking with no refund and no payment call`() {
        runBlocking {
            coEvery { bookingRepository.findById(bookingId) } returns booking(checkIn = LocalDate.now().plusDays(1))
            coEvery { bookingRepository.save(any()) } answers { firstArg() }

            val result = useCase.execute(bookingId, guestId, reason = null)

            result.fullRefund shouldBe false
            result.refundAmountEur.compareTo(BigDecimal.ZERO) shouldBe 0
            coVerify(exactly = 0) { paymentService.refund(any(), any()) }
        }
    }

    @Test
    fun `throws NotFound when the booking does not exist`() {
        runBlocking {
            coEvery { bookingRepository.findById(bookingId) } returns null
            shouldThrow<NotFoundException> { useCase.execute(bookingId, guestId, null) }
            coVerify(exactly = 0) { bookingRepository.save(any()) }
        }
    }

    @Test
    fun `throws Forbidden for another guest`() {
        runBlocking {
            coEvery { bookingRepository.findById(bookingId) } returns booking(guest = UUID.randomUUID())
            shouldThrow<ForbiddenException> { useCase.execute(bookingId, guestId, null) }
            coVerify(exactly = 0) { bookingRepository.save(any()) }
            coVerify(exactly = 0) { paymentService.refund(any(), any()) }
        }
    }

    @Test
    fun `throws BookingCannotCancel when the booking is not confirmed`() {
        runBlocking {
            coEvery { bookingRepository.findById(bookingId) } returns booking(status = BookingStatus.CANCELLED)
            shouldThrow<BookingCannotCancelException> { useCase.execute(bookingId, guestId, null) }
            coVerify(exactly = 0) { bookingRepository.save(any()) }
        }
    }
}
