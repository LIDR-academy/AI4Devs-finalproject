package com.stayhub.application.booking

import com.stayhub.application.error.ForbiddenException
import com.stayhub.application.error.NotFoundException
import com.stayhub.application.error.PaymentFailedException
import com.stayhub.domain.availability.AvailabilityHold
import com.stayhub.domain.availability.AvailabilityHoldRepository
import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingConfirmation
import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.booking.BookingStatus
import com.stayhub.domain.booking.EmailNotificationService
import com.stayhub.domain.booking.PaymentService
import com.stayhub.domain.booking.PaymentStatus
import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertyRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.shouldBe
import io.mockk.Runs
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.just
import io.mockk.mockk
import io.mockk.slot
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

class ConfirmBookingUseCaseTest {

    private val bookingRepository = mockk<BookingRepository>()
    private val holdRepository = mockk<AvailabilityHoldRepository>(relaxed = true)
    private val paymentService = mockk<PaymentService>()
    private val emailService = mockk<EmailNotificationService>(relaxed = true)
    private val propertyRepository = mockk<PropertyRepository>()

    private val useCase = ConfirmBookingUseCase(
        bookingRepository = bookingRepository,
        holdRepository = holdRepository,
        paymentService = paymentService,
        emailService = emailService,
        propertyRepository = propertyRepository,
    )

    private val bookingId = UUID.randomUUID()
    private val guestId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-000000000001")
    private val propertyId = UUID.fromString("cccccccc-cccc-cccc-cccc-000000001001")
    private val checkIn = LocalDate.now().plusDays(30)
    private val checkOut = checkIn.plusDays(3)

    private fun pendingBooking(
        guestIdValue: UUID = guestId,
        status: BookingStatus = BookingStatus.PENDING,
    ) = Booking(
        id = bookingId,
        propertyId = propertyId,
        guestId = guestIdValue,
        referenceNumber = "BK-20260101-ABC123",
        checkIn = checkIn,
        checkOut = checkOut,
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

    private val sampleProperty = Property(
        id = propertyId,
        hostId = UUID.randomUUID(),
        title = "Cosy Eixample Apartment",
        description = "",
        propertyType = "apartment",
        location = Property.Location(41.394, 2.161, "Barcelona", "Catalonia", "Spain", "Carrer 1"),
        maxGuests = 4,
        bedrooms = 2,
        bathrooms = 1,
        nightlyRateEur = 100.0,
        cleaningFeeEur = 50.0,
        amenities = emptyList(),
        houseRules = emptyList(),
        photos = emptyList(),
        avgRating = 4.8,
        reviewCount = 12,
    )

    @Test
    fun `happy path transitions PENDING to CONFIRMED and persists`() {
        runBlocking {
            coEvery { bookingRepository.findById(bookingId) } returns pendingBooking()
            coEvery { paymentService.getPaymentStatus("pi_stub_abc") } returns PaymentStatus.SUCCEEDED
            val saved = slot<Booking>()
            coEvery { bookingRepository.save(capture(saved)) } answers { saved.captured }
            coEvery { propertyRepository.findById(propertyId) } returns sampleProperty
            coEvery { holdRepository.findActiveHoldForDates(propertyId, checkIn, checkOut) } returns null

            val confirmed = useCase.execute(bookingId, "pi_stub_abc", guestId)

            confirmed.status shouldBe BookingStatus.CONFIRMED
            saved.captured.status shouldBe BookingStatus.CONFIRMED
            coVerify(exactly = 1) { bookingRepository.save(any()) }
        }
    }

    @Test
    fun `releases active hold for the same dates`() {
        runBlocking {
            val activeHold = AvailabilityHold(
                id = UUID.randomUUID(),
                propertyId = propertyId,
                guestId = guestId,
                checkIn = checkIn,
                checkOut = checkOut,
                heldUntil = Instant.now().plusSeconds(120),
                createdAt = Instant.now(),
            )
            coEvery { bookingRepository.findById(bookingId) } returns pendingBooking()
            coEvery { paymentService.getPaymentStatus("pi_stub_abc") } returns PaymentStatus.SUCCEEDED
            coEvery { bookingRepository.save(any()) } answers { firstArg() }
            coEvery { propertyRepository.findById(propertyId) } returns sampleProperty
            coEvery {
                holdRepository.findActiveHoldForDates(propertyId, checkIn, checkOut)
            } returns activeHold
            coEvery { holdRepository.releaseHold(activeHold.id) } just Runs

            useCase.execute(bookingId, "pi_stub_abc", guestId)

            coVerify(exactly = 1) { holdRepository.releaseHold(activeHold.id) }
        }
    }

    @Test
    fun `sends booking confirmation email after confirming`() {
        runBlocking {
            coEvery { bookingRepository.findById(bookingId) } returns pendingBooking()
            coEvery { paymentService.getPaymentStatus("pi_stub_abc") } returns PaymentStatus.SUCCEEDED
            coEvery { bookingRepository.save(any()) } answers { firstArg() }
            coEvery { propertyRepository.findById(propertyId) } returns sampleProperty
            coEvery { holdRepository.findActiveHoldForDates(propertyId, checkIn, checkOut) } returns null
            val captured = slot<BookingConfirmation>()
            coEvery { emailService.sendBookingConfirmation(capture(captured)) } just Runs

            useCase.execute(bookingId, "pi_stub_abc", guestId)

            // Email is fire-and-forget — give the launched coroutine a chance to run
            delay(100)

            coVerify(timeout = 1000) { emailService.sendBookingConfirmation(any()) }
            captured.captured.bookingId shouldBe bookingId
            captured.captured.referenceNumber shouldBe "BK-20260101-ABC123"
            captured.captured.propertyTitle shouldBe "Cosy Eixample Apartment"
            captured.captured.totalEur shouldBe BigDecimal("386.00")
        }
    }

    @Test
    fun `throws PaymentFailedException when payment status is not SUCCEEDED`() {
        runBlocking {
            coEvery { bookingRepository.findById(bookingId) } returns pendingBooking()
            coEvery { paymentService.getPaymentStatus("pi_stub_abc") } returns PaymentStatus.PENDING

            shouldThrow<PaymentFailedException> {
                useCase.execute(bookingId, "pi_stub_abc", guestId)
            }

            coVerify(exactly = 0) { bookingRepository.save(any()) }
        }
    }

    @Test
    fun `throws PaymentFailedException when payment status is FAILED`() {
        runBlocking {
            coEvery { bookingRepository.findById(bookingId) } returns pendingBooking()
            coEvery { paymentService.getPaymentStatus("pi_stub_abc") } returns PaymentStatus.FAILED

            shouldThrow<PaymentFailedException> {
                useCase.execute(bookingId, "pi_stub_abc", guestId)
            }
        }
    }

    @Test
    fun `throws ForbiddenException when booking belongs to a different guest`() {
        runBlocking {
            val otherGuest = UUID.randomUUID()
            coEvery { bookingRepository.findById(bookingId) } returns pendingBooking(guestIdValue = otherGuest)

            shouldThrow<ForbiddenException> {
                useCase.execute(bookingId, "pi_stub_abc", guestId)
            }

            coVerify(exactly = 0) { paymentService.getPaymentStatus(any()) }
            coVerify(exactly = 0) { bookingRepository.save(any()) }
        }
    }

    @Test
    fun `throws NotFoundException when booking does not exist`() {
        runBlocking {
            coEvery { bookingRepository.findById(bookingId) } returns null

            shouldThrow<NotFoundException> {
                useCase.execute(bookingId, "pi_stub_abc", guestId)
            }
        }
    }
}
