package com.stayhub.application.booking

import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

/**
 * Output of [CreateBookingUseCase].
 *
 * Mirrors the snake_case fields in the OpenAPI CreateBookingResponse schema
 * but exposes them as a Kotlin domain-flavoured object so the application
 * layer stays free of presentation-shaped types.
 */
data class CreateBookingResult(
    val bookingId: UUID,
    val referenceNumber: String,
    val priceBreakdown: BookingPriceBreakdown,
    val stripeClientSecret: String,
    val holdExpiresAt: Instant,
)

data class BookingPriceBreakdown(
    val nights: Int,
    val nightlyRateEur: Double,
    val subtotalEur: Double,
    val cleaningFeeEur: Double,
    val serviceFeeEur: Double,
    val taxEur: Double,
    val totalEur: Double,
) {
    fun nightlyRateAsBigDecimal(): BigDecimal = BigDecimal.valueOf(nightlyRateEur).setScale(2, java.math.RoundingMode.HALF_UP)
    fun cleaningFeeAsBigDecimal(): BigDecimal = BigDecimal.valueOf(cleaningFeeEur).setScale(2, java.math.RoundingMode.HALF_UP)
    fun serviceFeeAsBigDecimal(): BigDecimal = BigDecimal.valueOf(serviceFeeEur).setScale(2, java.math.RoundingMode.HALF_UP)
    fun taxAsBigDecimal(): BigDecimal = BigDecimal.valueOf(taxEur).setScale(2, java.math.RoundingMode.HALF_UP)
    fun totalAsBigDecimal(): BigDecimal = BigDecimal.valueOf(totalEur).setScale(2, java.math.RoundingMode.HALF_UP)
}
