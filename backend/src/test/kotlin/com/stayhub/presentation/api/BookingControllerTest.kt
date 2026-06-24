package com.stayhub.presentation.api

import com.stayhub.application.booking.BookingPriceBreakdown
import com.stayhub.application.booking.CancelBookingUseCase
import com.stayhub.application.booking.ConfirmBookingUseCase
import com.stayhub.application.booking.CreateBookingCommand
import com.stayhub.application.booking.CreateBookingResult
import com.stayhub.application.booking.CreateBookingUseCase
import com.stayhub.application.booking.GetBookingDetailsUseCase
import com.stayhub.application.booking.GetMyTripsUseCase
import com.stayhub.application.error.DatesUnavailableException
import com.stayhub.application.error.ForbiddenException
import com.stayhub.application.error.NotFoundException
import com.stayhub.application.error.PaymentFailedException
import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingStatus
import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertyRepository
import com.stayhub.presentation.middleware.GlobalExceptionHandler
import io.mockk.coEvery
import io.mockk.mockk
import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.ReactiveSecurityContextHolder
import org.springframework.security.core.context.SecurityContextImpl
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.web.server.WebFilter
import reactor.core.publisher.Mono
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

/**
 * WebFlux controller slice test. Uses [WebTestClient.bindToController] (no
 * Spring context) plus the spring-security-test [mockAuthentication] mutator
 * to populate the reactive security context with a UsernamePasswordAuthenticationToken
 * whose principal (subject) is the guest UUID — this matches the production
 * shape produced by JwtAuthFilter.
 */
class BookingControllerTest {

    private val createBookingUseCase = mockk<CreateBookingUseCase>()
    private val confirmBookingUseCase = mockk<ConfirmBookingUseCase>()
    private val getMyTripsUseCase = mockk<GetMyTripsUseCase>()
    private val getBookingDetailsUseCase = mockk<GetBookingDetailsUseCase>()
    private val cancelBookingUseCase = mockk<CancelBookingUseCase>()
    private val propertyRepository = mockk<PropertyRepository>()

    private val controller = BookingController(
        createBookingUseCase = createBookingUseCase,
        confirmBookingUseCase = confirmBookingUseCase,
        getMyTripsUseCase = getMyTripsUseCase,
        getBookingDetailsUseCase = getBookingDetailsUseCase,
        cancelBookingUseCase = cancelBookingUseCase,
        propertyRepository = propertyRepository,
    )

    private val guestId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-000000000001")
    private val propertyId = UUID.fromString("cccccccc-cccc-cccc-cccc-000000001001")
    private val bookingId = UUID.fromString("11111111-2222-3333-4444-555555555555")

    private fun client(principalSubject: String = guestId.toString()): WebTestClient {
        val auth = UsernamePasswordAuthenticationToken(principalSubject, "token", emptyList())
        val securityContextFilter = WebFilter { exchange, chain ->
            chain.filter(exchange)
                .contextWrite(
                    ReactiveSecurityContextHolder.withSecurityContext(
                        Mono.just(SecurityContextImpl(auth)),
                    ),
                )
        }
        return WebTestClient.bindToController(controller)
            .controllerAdvice(GlobalExceptionHandler::class.java)
            .webFilter<WebTestClient.ControllerSpec>(securityContextFilter)
            .build()
    }

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
        photos = listOf(Property.Photo("https://example.com/p.jpg", "")),
        avgRating = 4.8,
        reviewCount = 12,
    )

    @Test
    fun `POST create returns 201 with booking_id, reference_number, price_breakdown and stripe_client_secret`() {
        val checkIn = LocalDate.now().plusDays(30)
        val checkOut = checkIn.plusDays(3)

        coEvery {
            createBookingUseCase.execute(
                CreateBookingCommand(
                    propertyId = propertyId,
                    guestId = guestId,
                    checkIn = checkIn,
                    checkOut = checkOut,
                    guestCount = 2,
                ),
            )
        } returns CreateBookingResult(
            bookingId = bookingId,
            referenceNumber = "BK-20260101-ABC123",
            priceBreakdown = BookingPriceBreakdown(
                nights = 3,
                nightlyRateEur = 100.0,
                subtotalEur = 300.0,
                cleaningFeeEur = 50.0,
                serviceFeeEur = 36.0,
                taxEur = 0.0,
                totalEur = 386.0,
            ),
            stripeClientSecret = "pi_stub_abc_secret",
            holdExpiresAt = Instant.parse("2030-01-01T10:10:00Z"),
        )

        val body = """
            {
                "property_id": "$propertyId",
                "check_in": "$checkIn",
                "check_out": "$checkOut",
                "guest_count": 2
            }
        """.trimIndent()

        client()
            .post()
            .uri("/api/v1/bookings")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .exchange()
            .expectStatus().isCreated
            .expectBody()
            .jsonPath("$.booking_id").isEqualTo(bookingId.toString())
            .jsonPath("$.reference_number").isEqualTo("BK-20260101-ABC123")
            .jsonPath("$.stripe_client_secret").isEqualTo("pi_stub_abc_secret")
            .jsonPath("$.price_breakdown.nights").isEqualTo(3)
            .jsonPath("$.price_breakdown.nightly_rate_eur").isEqualTo(100.0)
            .jsonPath("$.price_breakdown.subtotal_eur").isEqualTo(300.0)
            .jsonPath("$.price_breakdown.cleaning_fee_eur").isEqualTo(50.0)
            .jsonPath("$.price_breakdown.service_fee_eur").isEqualTo(36.0)
            .jsonPath("$.price_breakdown.tax_eur").isEqualTo(0.0)
            .jsonPath("$.price_breakdown.total_eur").isEqualTo(386.0)
            .jsonPath("$.hold_expires_at").exists()
    }

    @Test
    fun `POST create returns 409 when dates are unavailable`() {
        val checkIn = LocalDate.now().plusDays(30)
        val checkOut = checkIn.plusDays(3)

        coEvery {
            createBookingUseCase.execute(any())
        } throws DatesUnavailableException("Property is already booked for the requested dates")

        val body = """
            {"property_id":"$propertyId","check_in":"$checkIn","check_out":"$checkOut","guest_count":2}
        """.trimIndent()

        client()
            .post()
            .uri("/api/v1/bookings")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .exchange()
            .expectStatus().isEqualTo(409)
            .expectBody()
            .jsonPath("$.error.code").isEqualTo("DATES_UNAVAILABLE")
    }

    @Test
    fun `POST create returns 404 when property does not exist`() {
        val checkIn = LocalDate.now().plusDays(30)
        val checkOut = checkIn.plusDays(3)

        coEvery {
            createBookingUseCase.execute(any())
        } throws NotFoundException("Property not found")

        val body = """
            {"property_id":"$propertyId","check_in":"$checkIn","check_out":"$checkOut","guest_count":2}
        """.trimIndent()

        client()
            .post()
            .uri("/api/v1/bookings")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .exchange()
            .expectStatus().isNotFound
            .expectBody()
            .jsonPath("$.error.code").isEqualTo("NOT_FOUND")
    }

    @Test
    fun `POST create returns 400 for missing property_id`() {
        val body = """
            {"check_in":"2030-06-01","check_out":"2030-06-05","guest_count":2}
        """.trimIndent()

        client()
            .post()
            .uri("/api/v1/bookings")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `POST confirm returns 200 with booking detail when payment succeeded`() {
        val now = Instant.now()
        val confirmed = Booking(
            id = bookingId,
            propertyId = propertyId,
            guestId = guestId,
            referenceNumber = "BK-20260101-ABC123",
            checkIn = LocalDate.of(2030, 6, 1),
            checkOut = LocalDate.of(2030, 6, 4),
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
            createdAt = now,
            updatedAt = now,
        )

        coEvery {
            confirmBookingUseCase.execute(bookingId, "pi_stub_abc", guestId)
        } returns confirmed
        coEvery { propertyRepository.findById(propertyId) } returns sampleProperty

        val body = """{"payment_intent_id":"pi_stub_abc"}"""

        client()
            .post()
            .uri("/api/v1/bookings/$bookingId/confirm")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(bookingId.toString())
            .jsonPath("$.reference_number").isEqualTo("BK-20260101-ABC123")
            .jsonPath("$.status").isEqualTo("confirmed")
            .jsonPath("$.guest_count").isEqualTo(2)
            .jsonPath("$.price_breakdown.total_eur").isEqualTo(386.0)
            .jsonPath("$.property.title").isEqualTo("Cosy Eixample Apartment")
            .jsonPath("$.property.city").isEqualTo("Barcelona")
    }

    @Test
    fun `POST confirm returns 403 when booking belongs to another guest`() {
        coEvery {
            confirmBookingUseCase.execute(bookingId, "pi_stub_abc", guestId)
        } throws ForbiddenException()

        val body = """{"payment_intent_id":"pi_stub_abc"}"""

        client()
            .post()
            .uri("/api/v1/bookings/$bookingId/confirm")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .exchange()
            .expectStatus().isForbidden
            .expectBody()
            .jsonPath("$.error.code").isEqualTo("FORBIDDEN")
    }

    @Test
    fun `POST confirm returns 400 when payment status is not SUCCEEDED`() {
        coEvery {
            confirmBookingUseCase.execute(bookingId, "pi_stub_abc", guestId)
        } throws PaymentFailedException("Payment intent not succeeded")

        val body = """{"payment_intent_id":"pi_stub_abc"}"""

        client()
            .post()
            .uri("/api/v1/bookings/$bookingId/confirm")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .exchange()
            .expectStatus().isBadRequest
            .expectBody()
            .jsonPath("$.error.code").isEqualTo("PAYMENT_FAILED")
    }
}
