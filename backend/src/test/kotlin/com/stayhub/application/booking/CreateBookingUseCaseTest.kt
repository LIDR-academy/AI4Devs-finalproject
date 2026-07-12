package com.stayhub.application.booking

import com.stayhub.application.error.DatesUnavailableException
import com.stayhub.application.error.NotFoundException
import com.stayhub.domain.availability.AvailabilityHold
import com.stayhub.domain.availability.AvailabilityHoldRepository
import com.stayhub.domain.availability.AvailabilityRepository
import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.booking.BookingStatus
import com.stayhub.domain.booking.PaymentIntent
import com.stayhub.domain.booking.PaymentService
import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertyRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.doubles.plusOrMinus
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldStartWith
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

class CreateBookingUseCaseTest {

    private val propertyRepository = mockk<PropertyRepository>()
    private val bookingRepository = mockk<BookingRepository>()
    private val holdRepository = mockk<AvailabilityHoldRepository>()
    private val availabilityRepository = mockk<AvailabilityRepository>()
    private val paymentService = mockk<PaymentService>()

    private val useCase = CreateBookingUseCase(
        propertyRepository = propertyRepository,
        bookingRepository = bookingRepository,
        holdRepository = holdRepository,
        availabilityRepository = availabilityRepository,
        paymentService = paymentService,
    )

    private val propertyId = UUID.fromString("cccccccc-cccc-cccc-cccc-000000001001")
    private val guestId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-000000000001")

    private val sampleProperty = Property(
        id = propertyId,
        hostId = UUID.randomUUID(),
        title = "Cosy Eixample Apartment",
        description = "Lovely",
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

    private val checkIn = LocalDate.now().plusDays(30)
    private val checkOut = checkIn.plusDays(3) // 3 nights

    private fun stubAvailabilityFree() {
        coEvery { holdRepository.findActiveHoldForDates(propertyId, checkIn, checkOut) } returns null
        coEvery {
            bookingRepository.findByPropertyAndDates(propertyId, checkIn, checkOut)
        } returns emptyList()
        coEvery {
            availabilityRepository.findUnavailableDates(propertyId, checkIn, checkOut.minusDays(1))
        } returns emptyList()
    }

    private fun stubHoldCreation(): AvailabilityHold {
        val hold = AvailabilityHold(
            id = UUID.randomUUID(),
            propertyId = propertyId,
            guestId = guestId,
            checkIn = checkIn,
            checkOut = checkOut,
            heldUntil = Instant.now().plusSeconds(600),
            createdAt = Instant.now(),
        )
        coEvery { holdRepository.createHold(propertyId, guestId, checkIn, checkOut) } returns hold
        return hold
    }

    private fun stubPaymentIntent() {
        coEvery {
            paymentService.createPaymentIntent(any(), any())
        } returns PaymentIntent(id = "pi_stub_abc", clientSecret = "pi_stub_abc_secret")
    }

    private fun stubBookingSave() {
        val saved = slot<Booking>()
        coEvery { bookingRepository.save(capture(saved)) } answers { saved.captured }
    }

    @Test
    fun `happy path returns CreateBookingResult with correct price breakdown`() {
        runBlocking {
            coEvery { propertyRepository.findById(propertyId) } returns sampleProperty
            stubAvailabilityFree()
            stubHoldCreation()
            stubPaymentIntent()
            stubBookingSave()

            val result = useCase.execute(
                CreateBookingCommand(
                    propertyId = propertyId,
                    guestId = guestId,
                    checkIn = checkIn,
                    checkOut = checkOut,
                    guestCount = 2,
                )
            )

            // Price: 100 * 3 + 50 + (300 * 0.12) + 0 = 300 + 50 + 36 + 0 = 386
            result.priceBreakdown.nights shouldBe 3
            result.priceBreakdown.nightlyRateEur shouldBe 100.0
            result.priceBreakdown.subtotalEur shouldBe (300.0 plusOrMinus 0.01)
            result.priceBreakdown.cleaningFeeEur shouldBe 50.0
            result.priceBreakdown.serviceFeeEur shouldBe (36.0 plusOrMinus 0.01)
            result.priceBreakdown.taxEur shouldBe 0.0
            result.priceBreakdown.totalEur shouldBe (386.0 plusOrMinus 0.01)
            result.stripeClientSecret shouldStartWith "pi_stub_"
            result.referenceNumber shouldStartWith "BK-"
        }
    }

    @Test
    fun `happy path persists booking with PENDING status`() {
        runBlocking {
            coEvery { propertyRepository.findById(propertyId) } returns sampleProperty
            stubAvailabilityFree()
            stubHoldCreation()
            stubPaymentIntent()
            val saved = slot<Booking>()
            coEvery { bookingRepository.save(capture(saved)) } answers { saved.captured }

            useCase.execute(
                CreateBookingCommand(
                    propertyId = propertyId,
                    guestId = guestId,
                    checkIn = checkIn,
                    checkOut = checkOut,
                    guestCount = 2,
                )
            )

            saved.captured.status shouldBe BookingStatus.PENDING
            saved.captured.guestId shouldBe guestId
            saved.captured.propertyId shouldBe propertyId
            saved.captured.guestCount shouldBe 2
            saved.captured.nights shouldBe 3
        }
    }

    @Test
    fun `throws DatesUnavailableException when active hold exists`() {
        runBlocking {
            coEvery { propertyRepository.findById(propertyId) } returns sampleProperty
            coEvery {
                holdRepository.findActiveHoldForDates(propertyId, checkIn, checkOut)
            } returns AvailabilityHold(
                id = UUID.randomUUID(),
                propertyId = propertyId,
                guestId = UUID.randomUUID(),
                checkIn = checkIn,
                checkOut = checkOut,
                heldUntil = Instant.now().plusSeconds(120),
                createdAt = Instant.now(),
            )

            shouldThrow<DatesUnavailableException> {
                useCase.execute(
                    CreateBookingCommand(
                        propertyId = propertyId,
                        guestId = guestId,
                        checkIn = checkIn,
                        checkOut = checkOut,
                        guestCount = 2,
                    )
                )
            }

            coVerify(exactly = 0) { holdRepository.createHold(any(), any(), any(), any()) }
            coVerify(exactly = 0) { bookingRepository.save(any()) }
        }
    }

    @Test
    fun `throws DatesUnavailableException when overlapping non-cancelled booking exists`() {
        runBlocking {
            coEvery { propertyRepository.findById(propertyId) } returns sampleProperty
            coEvery {
                holdRepository.findActiveHoldForDates(propertyId, checkIn, checkOut)
            } returns null
            coEvery {
                bookingRepository.findByPropertyAndDates(propertyId, checkIn, checkOut)
            } returns listOf(
                Booking(
                    id = UUID.randomUUID(),
                    propertyId = propertyId,
                    guestId = UUID.randomUUID(),
                    referenceNumber = "BK-OLD",
                    checkIn = checkIn,
                    checkOut = checkOut,
                    guestCount = 2,
                    nights = 3,
                    nightlyRateEur = BigDecimal("100.00"),
                    cleaningFeeEur = BigDecimal("50.00"),
                    serviceFeeEur = BigDecimal("36.00"),
                    taxEur = BigDecimal("0.00"),
                    totalEur = BigDecimal("386.00"),
                    status = BookingStatus.CONFIRMED,
                    stripePaymentIntentId = "pi_old",
                    cancellationReason = null,
                    cancelledAt = null,
                    createdAt = Instant.now(),
                    updatedAt = Instant.now(),
                )
            )

            shouldThrow<DatesUnavailableException> {
                useCase.execute(
                    CreateBookingCommand(
                        propertyId = propertyId,
                        guestId = guestId,
                        checkIn = checkIn,
                        checkOut = checkOut,
                        guestCount = 2,
                    )
                )
            }

            coVerify(exactly = 0) { bookingRepository.save(any()) }
        }
    }

    @Test
    fun `cancelled overlapping bookings do NOT block creation`() {
        runBlocking {
            coEvery { propertyRepository.findById(propertyId) } returns sampleProperty
            coEvery {
                holdRepository.findActiveHoldForDates(propertyId, checkIn, checkOut)
            } returns null
            coEvery {
                bookingRepository.findByPropertyAndDates(propertyId, checkIn, checkOut)
            } returns listOf(
                Booking(
                    id = UUID.randomUUID(),
                    propertyId = propertyId,
                    guestId = UUID.randomUUID(),
                    referenceNumber = "BK-CANCEL",
                    checkIn = checkIn,
                    checkOut = checkOut,
                    guestCount = 2,
                    nights = 3,
                    nightlyRateEur = BigDecimal("100.00"),
                    cleaningFeeEur = BigDecimal("50.00"),
                    serviceFeeEur = BigDecimal("36.00"),
                    taxEur = BigDecimal("0.00"),
                    totalEur = BigDecimal("386.00"),
                    status = BookingStatus.CANCELLED,
                    stripePaymentIntentId = "pi_cancelled",
                    cancellationReason = "test",
                    cancelledAt = Instant.now(),
                    createdAt = Instant.now(),
                    updatedAt = Instant.now(),
                )
            )
            coEvery {
                availabilityRepository.findUnavailableDates(propertyId, checkIn, checkOut.minusDays(1))
            } returns emptyList()
            stubHoldCreation()
            stubPaymentIntent()
            stubBookingSave()

            // Should NOT throw
            useCase.execute(
                CreateBookingCommand(
                    propertyId = propertyId,
                    guestId = guestId,
                    checkIn = checkIn,
                    checkOut = checkOut,
                    guestCount = 2,
                )
            )

            coVerify(exactly = 1) { bookingRepository.save(any()) }
        }
    }

    @Test
    fun `throws NotFoundException when property does not exist`() {
        runBlocking {
            coEvery { propertyRepository.findById(propertyId) } returns null

            shouldThrow<NotFoundException> {
                useCase.execute(
                    CreateBookingCommand(
                        propertyId = propertyId,
                        guestId = guestId,
                        checkIn = checkIn,
                        checkOut = checkOut,
                        guestCount = 2,
                    )
                )
            }

            coVerify(exactly = 0) { holdRepository.createHold(any(), any(), any(), any()) }
            coVerify(exactly = 0) { bookingRepository.save(any()) }
        }
    }

    @Test
    fun `creates 10 minute hold and Stripe PaymentIntent before persisting booking`() {
        runBlocking {
            coEvery { propertyRepository.findById(propertyId) } returns sampleProperty
            stubAvailabilityFree()
            stubHoldCreation()
            stubPaymentIntent()
            stubBookingSave()

            useCase.execute(
                CreateBookingCommand(
                    propertyId = propertyId,
                    guestId = guestId,
                    checkIn = checkIn,
                    checkOut = checkOut,
                    guestCount = 2,
                )
            )

            coVerify(exactly = 1) { holdRepository.createHold(propertyId, guestId, checkIn, checkOut) }
            coVerify(exactly = 1) { paymentService.createPaymentIntent(any(), any()) }
            coVerify(exactly = 1) { bookingRepository.save(any()) }
        }
    }
}
