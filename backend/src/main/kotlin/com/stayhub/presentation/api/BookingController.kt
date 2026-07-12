package com.stayhub.presentation.api

import com.stayhub.application.booking.BookingPriceBreakdown
import com.stayhub.application.booking.CancelBookingUseCase
import com.stayhub.application.booking.CancellationPolicy
import com.stayhub.application.booking.ConfirmBookingUseCase
import com.stayhub.application.booking.CreateBookingCommand
import com.stayhub.application.booking.CreateBookingResult
import com.stayhub.application.booking.CreateBookingUseCase
import com.stayhub.application.booking.GetBookingDetailsUseCase
import com.stayhub.application.booking.GetMyTripsUseCase
import com.stayhub.application.booking.MyTripsResult
import com.stayhub.application.error.UnauthorizedException
import com.stayhub.application.error.ValidationException
import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.TripCategory
import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertyRepository
import com.stayhub.presentation.dto.booking.BookingDetailResponse
import com.stayhub.presentation.dto.booking.CancelBookingRequest
import com.stayhub.presentation.dto.booking.CancellationResponse
import com.stayhub.presentation.dto.booking.ConfirmBookingRequest
import com.stayhub.presentation.dto.booking.CreateBookingRequest
import com.stayhub.presentation.dto.booking.CreateBookingResponse
import com.stayhub.presentation.dto.booking.MyTripsResponse
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import kotlinx.coroutines.reactor.awaitSingleOrNull
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.ReactiveSecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

/**
 * Booking endpoints. All require a Bearer JWT (enforced by SecurityConfig);
 * the JWT subject is the guestId (UUID), a malformed subject yields 401.
 *
 *  POST /api/v1/bookings                  — create + Stripe PaymentIntent
 *  POST /api/v1/bookings/{id}/confirm     — confirm after payment
 *  GET  /api/v1/bookings/my-trips         — list the caller's bookings (US4)
 *  GET  /api/v1/bookings/{id}             — booking detail (US4)
 *  POST /api/v1/bookings/{id}/cancel      — cancel a confirmed booking (US4)
 */
@Tag(name = "Bookings", description = "Create, confirm, list and cancel bookings (requires a Bearer JWT)")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/bookings")
class BookingController(
    private val createBookingUseCase: CreateBookingUseCase,
    private val confirmBookingUseCase: ConfirmBookingUseCase,
    private val getMyTripsUseCase: GetMyTripsUseCase,
    private val getBookingDetailsUseCase: GetBookingDetailsUseCase,
    private val cancelBookingUseCase: CancelBookingUseCase,
    private val propertyRepository: PropertyRepository,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    suspend fun create(
        @Valid @RequestBody request: CreateBookingRequest,
    ): CreateBookingResponse {
        val guestId = currentGuestId()

        val propertyId = request.property_id ?: throw ValidationException("property_id is required")
        val checkIn = request.check_in ?: throw ValidationException("check_in is required")
        val checkOut = request.check_out ?: throw ValidationException("check_out is required")

        log.info(
            "Create booking: guestId={} propertyId={} checkIn={} checkOut={} guestCount={}",
            guestId, propertyId, checkIn, checkOut, request.guest_count,
        )

        val result = createBookingUseCase.execute(
            CreateBookingCommand(
                propertyId = propertyId,
                guestId = guestId,
                checkIn = checkIn,
                checkOut = checkOut,
                guestCount = request.guest_count,
            )
        )

        return result.toResponse()
    }

    @PostMapping("/{bookingId}/confirm")
    suspend fun confirm(
        @PathVariable bookingId: UUID,
        @Valid @RequestBody request: ConfirmBookingRequest,
    ): BookingDetailResponse {
        val guestId = currentGuestId()
        val paymentIntentId = request.payment_intent_id
            ?: throw ValidationException("payment_intent_id is required")

        log.info("Confirm booking: bookingId={} guestId={} paymentIntentId={}", bookingId, guestId, paymentIntentId)

        val confirmed = confirmBookingUseCase.execute(bookingId, paymentIntentId, guestId)
        val property = runCatching { propertyRepository.findById(confirmed.propertyId) }.getOrNull()
        return confirmed.toDetailResponse(property)
    }

    @GetMapping("/my-trips")
    suspend fun myTrips(
        @RequestParam(required = false, defaultValue = "all") status: String,
        @RequestParam(required = false, defaultValue = "1") page: Int,
        @RequestParam(required = false, defaultValue = "10") size: Int,
    ): MyTripsResponse {
        val guestId = currentGuestId()
        if (page < 1) throw ValidationException("page must be >= 1")
        if (size < 1 || size > 50) throw ValidationException("size must be between 1 and 50")

        val category = parseCategory(status)
        val result = getMyTripsUseCase.execute(guestId, category, page, size)
        return result.toResponse()
    }

    @GetMapping("/{bookingId}")
    suspend fun detail(@PathVariable bookingId: UUID): BookingDetailResponse {
        val guestId = currentGuestId()
        val result = getBookingDetailsUseCase.execute(bookingId, guestId)
        return result.booking.toDetailResponse(
            property = result.property,
            canCancel = result.canCancel,
            refundAmountEur = result.refundAmountEur,
        )
    }

    @PostMapping("/{bookingId}/cancel")
    suspend fun cancel(
        @PathVariable bookingId: UUID,
        @Valid @RequestBody(required = false) request: CancelBookingRequest?,
    ): CancellationResponse {
        val guestId = currentGuestId()
        val result = cancelBookingUseCase.execute(bookingId, guestId, request?.reason)
        return CancellationResponse(
            booking_id = result.bookingId.toString(),
            status = "cancelled",
            refund_amount_eur = result.refundAmountEur.toDouble(),
            refund_status = if (result.fullRefund) "full_refund" else "no_refund",
        )
    }

    private fun parseCategory(status: String): TripCategory = when (status.lowercase()) {
        "all" -> TripCategory.ALL
        "upcoming" -> TripCategory.UPCOMING
        "past" -> TripCategory.PAST
        "cancelled" -> TripCategory.CANCELLED
        else -> throw ValidationException(
            "Invalid status filter: $status (allowed: upcoming, past, cancelled, all)"
        )
    }

    /**
     * Reads the JWT subject (set by JwtAuthFilter) from the reactive security
     * context and converts it to the guest UUID. 401 if absent or malformed.
     */
    private suspend fun currentGuestId(): UUID {
        val authentication = ReactiveSecurityContextHolder.getContext()
            .map { it.authentication }
            .awaitSingleOrNull()
            ?: throw UnauthorizedException()

        val raw = when (val principal = authentication.principal) {
            is String -> principal
            is org.springframework.security.core.userdetails.UserDetails -> principal.username
            else -> principal?.toString()
        } ?: throw UnauthorizedException()

        return runCatching { UUID.fromString(raw) }
            .getOrElse {
                throw UnauthorizedException("JWT subject is not a valid UUID: $raw")
            }
    }

    private fun CreateBookingResult.toResponse(): CreateBookingResponse =
        CreateBookingResponse(
            booking_id = bookingId.toString(),
            reference_number = referenceNumber,
            price_breakdown = priceBreakdown.toDto(),
            stripe_client_secret = stripeClientSecret,
            hold_expires_at = holdExpiresAt.toString(),
        )

    private fun BookingPriceBreakdown.toDto(): CreateBookingResponse.PriceBreakdownDto =
        CreateBookingResponse.PriceBreakdownDto(
            nights = nights,
            nightly_rate_eur = nightlyRateEur,
            subtotal_eur = subtotalEur,
            cleaning_fee_eur = cleaningFeeEur,
            service_fee_eur = serviceFeeEur,
            tax_eur = taxEur,
            total_eur = totalEur,
        )

    private fun MyTripsResult.toResponse(): MyTripsResponse =
        MyTripsResponse(
            bookings = bookings.map {
                MyTripsResponse.BookingSummaryDto(
                    id = it.id.toString(),
                    reference_number = it.referenceNumber,
                    property_title = it.propertyTitle,
                    property_photo_url = it.propertyPhotoUrl,
                    city = it.city,
                    check_in = it.checkIn.toString(),
                    check_out = it.checkOut.toString(),
                    status = it.status.name.lowercase(),
                    total_eur = it.totalEur.toDouble(),
                )
            },
            pagination = MyTripsResponse.PaginationDto(
                page = page,
                size = size,
                total_results = totalResults,
                total_pages = totalPages,
            ),
        )

    /**
     * Maps a booking to the detail response. When [canCancel]/[refundAmountEur]
     * are not supplied (confirm flow), they're computed here via CancellationPolicy.
     */
    private fun Booking.toDetailResponse(
        property: Property?,
        canCancel: Boolean = CancellationPolicy.canCancel(this),
        refundAmountEur: BigDecimal? =
            if (CancellationPolicy.canCancel(this)) CancellationPolicy.refundAmountEur(this, Instant.now()) else null,
    ): BookingDetailResponse {
        val subtotal = (nightlyRateEur.toDouble() * nights)
        return BookingDetailResponse(
            id = id.toString(),
            reference_number = referenceNumber,
            property = property?.let {
                BookingDetailResponse.PropertyDto(
                    id = it.id.toString(),
                    title = it.title,
                    photo_url = it.photos.firstOrNull()?.url ?: "",
                    city = it.location.city,
                    country = it.location.country,
                    address = it.location.address,
                )
            },
            check_in = checkIn.toString(),
            check_out = checkOut.toString(),
            guest_count = guestCount,
            status = status.name.lowercase(),
            price_breakdown = BookingDetailResponse.PriceBreakdownDto(
                nights = nights,
                nightly_rate_eur = nightlyRateEur.toDouble(),
                subtotal_eur = subtotal,
                cleaning_fee_eur = cleaningFeeEur.toDouble(),
                service_fee_eur = serviceFeeEur.toDouble(),
                tax_eur = taxEur.toDouble(),
                total_eur = totalEur.toDouble(),
            ),
            cancellation_policy = "Full refund if cancelled 48+ hours before check-in",
            can_cancel = canCancel,
            refund_amount_eur = refundAmountEur?.toDouble(),
            created_at = createdAt.toString(),
        )
    }
}
